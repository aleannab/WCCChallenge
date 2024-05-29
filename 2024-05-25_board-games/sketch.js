// Candyland Unwrapped by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Classic Board Games
//
// Yay! This was the first time my topic was chosen.
// This is inspired by the board game Candy Land (classic children's board game in the United States, not sure about internationally).
// I imagine pulling the board game path off like a super long Hershey's Kiss paper ribbon, and discarding it aside.
// (we have much better American chocolate! Don't judge us on Hershey, was just apt for the example 😝 lol)
//
// There is currently a bug, every so often the canvas is completely black. This happens rarely.
// Sometimes also the board game spaces get a little funky at the sharp bends of the line.
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gCircles = [];
let gAllPathSegments = [];

let gPalette = ['#ea0319', '#981183', '#f3e022', '#03a3ee', '#f28b31', '#79d29d'];
let gBgColor = '#f1f3f4';

let gMaskLayer;

let gPadding = 100;
let gStrokeWeight = 15;
let gFirstSkipped = false;

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (3 * windowHeight) / 4;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.95 * w, 0.95 * h);
  noStroke();
  noLoop();

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.erase();

  gMaskLayer.stroke(0);
  gMaskLayer.strokeWeight(gStrokeWeight * 0.9);
  gMaskLayer.noFill();

  createGameBoardPath();
}

function draw() {
  noStroke();
  background(gBgColor);
  gMaskLayer.background(gBgColor);

  for (let i = 0; i < gAllPathSegments.length; i++) {
    gAllPathSegments[i].draw();
  }

  image(gMaskLayer, 0, 0);

  // stroke(0);
  // noFill();
  // for (let i=0; i < gCircles.length; i++){
  // 	circle(gCircles[i].x, gCircles[i].y, 30);
  // }
}

function createGameBoardPath() {
  createPathCircleRefs();
  createPathSegments();
}

function createPathSegments() {
  gFirstSkipped = false;
  let controlPoints = [];
  for (let i = 0; i < gCircles.length; i++) {
    if (i < gCircles.length - 1) {
      controlPoints.push(calculateControlPoints(gCircles[i], gCircles[i + 1], random(50, 200), random(50, 200)));
    }
  }

  gAllPathSegments = [];
  let lastPos = createVector(0, 0);
  let lastSpaceLine = [createVector(0, 0), createVector(0, 0)];
  let lastColorIndex = int(random(gPalette.length));
  for (let i = 0; i < controlPoints.length; i++) {
    let segment = new PathSegment(gCircles[i], controlPoints[i][0], controlPoints[i][1], gCircles[i + 1], lastPos, lastSpaceLine, lastColorIndex);
    gAllPathSegments.push(segment);
    lastPos = segment.lastPos;
    lastColorIndex = segment.lastColorIndex;
    lastSpaceLine = segment.gameSpaceLines[segment.gameSpaceLines.length - 1];
  }
}

function createPathCircleRefs() {
  gCircles.length = 0;
  let xp = random(gPadding, width - gPadding);
  let yp = gPadding + random() * gPadding;
  let rowCount = int(random(5, 7));
  let vSpacing = (height - 2 * gPadding) / rowCount;
  let prevPosX = createVector(-1, -1);
  let isLeft = random() < 0.5;
  for (let row = 0; row < rowCount; row++) {
    if (random() < 0.05) continue;
    yp = vSpacing * row + gPadding;
    isLeft = !isLeft;
    let colCount = int(random(2, 5));
    let hSpacingMax = 0.9 * (width / (colCount - 1));
    let hSpacing = isLeft ? -hSpacingMax : hSpacingMax;
    for (let col = 0; col < colCount; col++) {
      let circlePos = checkBounds(createVector(xp, yp + random(-1, 1) * vSpacing * 0.5));
      if (circlePos.dist(prevPosX) > 100) {
        gCircles.push(circlePos);
        prevPosX = circlePos;
      }

      xp += random(0.6, 1.4) * hSpacing;
    }
    xp = random(gPadding, width - gPadding);
  }
}

function calculateControlPoints(start, end, offsetX, offsetY) {
  let controlPoint1 = createVector(start.x + offsetX, start.y + offsetY);
  let controlPoint2 = createVector(end.x - offsetX, end.y - offsetY);
  return [controlPoint1, controlPoint2];
}

function mousePressed() {
  createGameBoardPath();
  redraw();
}

function checkBounds(pos) {
  let xp = constrain(pos.x, gPadding, width - gPadding);
  let yp = constrain(pos.y, gPadding, height - gPadding);
  return createVector(xp, yp);
}

class PathSegment {
  constructor(a0, c0, c1, a1, prevPos, lastSpaceLine, colIndex) {
    this.anchor0 = a0;
    this.control0 = c0;
    this.control1 = c1;
    this.anchor1 = a1;
    this.gameSpaceLines = [lastSpaceLine];
    this.lastPos = createVector(0, 0);
    this.colorIndexStart = colIndex + 1;
    this.lastColorIndex = 0;

    this.calculateSpacing(prevPos);
  }

  draw() {
    this.drawSegment();
    this.drawGameSpaces();
  }

  drawSegment() {
    gMaskLayer.bezier(
      this.anchor0.x,
      this.anchor0.y,
      this.control0.x,
      this.control0.y,
      this.control1.x,
      this.control1.y,
      this.anchor1.x,
      this.anchor1.y
    );
  }

  drawGameSpaces() {
    let colorIndex = this.colorIndexStart;
    for (let i = 0; i < this.gameSpaceLines.length - 1; i++) {
      if (!gFirstSkipped) {
        gFirstSkipped = true;
        continue;
      }
      let current = this.gameSpaceLines[i];
      let next = this.gameSpaceLines[i + 1];
      fill(gPalette[colorIndex % gPalette.length]);
      quad(current[0].x, current[0].y, current[1].x, current[1].y, next[1].x, next[1].y, next[0].x, next[0].y);
      colorIndex++;
    }
  }

  calculateSpacing(prevPos) {
    let percentComplete = 0;
    let offset = 0.65 * gStrokeWeight;
    let stepSize = 0.001;
    let colorIndex = this.colorIndexStart;
    while (percentComplete <= 1) {
      let xp = bezierPoint(this.anchor0.x, this.control0.x, this.control1.x, this.anchor1.x, percentComplete);
      let yp = bezierPoint(this.anchor0.y, this.control0.y, this.control1.y, this.anchor1.y, percentComplete);

      let tangent = createVector(
        bezierTangent(this.anchor0.x, this.control0.x, this.control1.x, this.anchor1.x, percentComplete),
        bezierTangent(this.anchor0.y, this.control0.y, this.control1.y, this.anchor1.y, percentComplete)
      ).normalize();

      let perpendicular = createVector(-tangent.y, tangent.x).mult(offset);

      let top = createVector(xp, yp).add(perpendicular);
      let bottom = createVector(xp, yp).sub(perpendicular);

      if (dist(xp, yp, prevPos.x, prevPos.y) > gStrokeWeight) {
        this.gameSpaceLines.push([top, bottom]);
        colorIndex++;
        prevPos.set(xp, yp);
      }

      percentComplete += stepSize;
    }
    this.lastPos.set(prevPos);
    this.lastColorIndex = (colorIndex - 1) % gPalette.length;
  }
}
