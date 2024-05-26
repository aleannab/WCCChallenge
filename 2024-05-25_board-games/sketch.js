let gCircles = [];
let gAllPathSegments = [];

let gPalette = ['#ea0319', '#981183', '#f3e022', '#03a3ee', '#f28b31', '#79d29d'];

let gMaskLayer;

let gPadding = 100;
let gStrokeWeight = 15;

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (4 * windowHeight) / 3;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.95 * w, 0.95 * h);
  noStroke();
  noLoop();

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.erase();

  gMaskLayer.stroke(0);
  gMaskLayer.strokeWeight(gStrokeWeight);
  gMaskLayer.noFill();

  createGameBoardPath();
}

function draw() {
  noStroke();
  background(255);
  gMaskLayer.background('#ffffff');

  for (let i = 0; i < gAllPathSegments.length; i++) {
    gAllPathSegments[i].draw();
  }

  image(gMaskLayer, 0, 0);

  // gCircles.forEach((circ) => {
  //   stroke(0);
  //   noFill();
  //   circle(circ.x, circ.y, 100);
  // });
}

function createGameBoardPath() {
  createPathCircleRefs();
  createPathSegments();
}

function createPathSegments() {
  let controlPoints = [];
  for (let i = 0; i < gCircles.length; i++) {
    if (i < gCircles.length - 1) {
      controlPoints.push(calculateControlPoints(gCircles[i], gCircles[i + 1], random(50, 100), random(50, 100)));
    }
  }

  gAllPathSegments = [];
  let lastPos = createVector(0, 0);
  let lastSpaceLine = [createVector(0, 0), createVector(0, 0)];
  for (let i = 0; i < controlPoints.length; i++) {
    let segment = new PathSegment(gCircles[i], controlPoints[i][0], controlPoints[i][1], gCircles[i + 1], lastPos, lastSpaceLine);
    gAllPathSegments.push(segment);
    lastPos = segment.lastPos;
    lastSpaceLine = segment.gameSpaceLines[segment.gameSpaceLines.length - 1];
  }
}

function createPathCircleRefs() {
  gCircles.length = 0;
  let xp = random(gPadding, width / 2);
  let yp = gPadding;
  let rowCount = int(random(3, 7));
  let vSpacing = (height - 2 * gPadding) / rowCount;
  for (let row = 0; row < rowCount; row++) {
    yp = vSpacing * row + gPadding;
    let isRowOdd = row % 2 != 0;
    let colCount = random() < 0.2 ? 1 : 2;
    let hSpacingMax = 0.9 * (width / (colCount - 1));
    let hSpacing = isRowOdd ? -hSpacingMax : hSpacingMax;
    for (let col = 0; col < colCount; col++) {
      let circlePos = checkBounds(createVector(xp, yp + random(-1, 1) * vSpacing * 0.1));

      gCircles.push(circlePos);
      xp += random(0.5, 0.9) * hSpacing;
    }
    xp = isRowOdd ? random(50, 0.5 * width - 50) : random(0.5 * width + 50, width - 50);
    yp += vSpacing;
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
  constructor(a0, c0, c1, a1, prevPos, lastSpaceLine) {
    this.anchor0 = a0;
    this.control0 = c0;
    this.control1 = c1;
    this.anchor1 = a1;
    this.gameSpaceLines = [lastSpaceLine];
    this.lastPos = createVector(0, 0);

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
    for (let i = 0; i < this.gameSpaceLines.length - 1; i++) {
      let current = this.gameSpaceLines[i];
      let next = this.gameSpaceLines[i + 1];
      fill(gPalette[i % gPalette.length]);
      quad(current[0].x, current[0].y, current[1].x, current[1].y, next[1].x, next[1].y, next[0].x, next[0].y);
    }
  }

  calculateSpacing(prevPos) {
    let percentComplete = 0;
    let offset = 0.6 * gStrokeWeight;
    let stepSize = 0.001;
    let lastTangent = createVector(1, 0);
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
        prevPos.set(xp, yp);
      }

      lastTangent = tangent;
      percentComplete += stepSize;
    }
    this.lastPos.set(prevPos);
  }
}
