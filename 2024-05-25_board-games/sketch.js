let gCircles = [];
let gAllPathSegments = [];

let gPalette = ['#ea0319', '#981183', '#f3e022', '#03a3ee', '#f28b31', '#79d29d'];

let gMaskLayer;

let gPadding = 100;

function setup() {
  //setup canvas
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (4 * windowHeight) / 3;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.95 * w, 0.95 * h);
  noStroke();
  noLoop();

  //setup mask layer
  gMaskLayer = createGraphics(width, height);
  //gMaskLayer.strokeCap(PROJECT);
  gMaskLayer.erase();

  gMaskLayer.stroke(0);
  gMaskLayer.strokeWeight(30);
  gMaskLayer.noFill();

  createGameBoardPath();
}

function draw() {
  background(255);
  gMaskLayer.background('#ffffff');

  // Draw bezier path
  let colorIndex = 0;
  let prevPos = createVector(0, 0);

  for (let i = 0; i < gAllPathSegments.length; i++) {
    let path = gAllPathSegments[i];
    // draw segment to mask
    gMaskLayer.bezier(
      path.anchor0.x,
      path.anchor0.y,
      path.control0.x,
      path.control0.y,
      path.control1.x,
      path.control1.y,
      path.anchor1.x,
      path.anchor1.y
    );

    // divide segment into game spaces
    let percentComplete = 0;
    while (percentComplete <= 1) {
      let x = bezierPoint(path.anchor0.x, path.control0.x, path.control1.x, path.anchor1.x, percentComplete);
      let y = bezierPoint(path.anchor0.y, path.control0.y, path.control1.y, path.anchor1.y, percentComplete);

      // only create a space if the distance is far enough
      if (dist(x, y, prevPos.x, prevPos.y) > 40) {
        circle(x, y, 80);
        fill(gPalette[colorIndex++ % gPalette.length]);

        prevPos.x = x;
        prevPos.y = y;
      }
      percentComplete += 0.001;
    }
  }

  image(gMaskLayer, 0, 0);

  // for (let i = 0; i < gCircles.length; i++) {
  //   fill(0);
  //   circle(gCircles[i].x, gCircles[i].y, 50);
  // }
}

function createGameBoardPath() {
  createPathCircleRefs();
  createPathSegments();
}

function createPathSegments() {
  // calculate control points
  let controlPoints = [];
  for (let i = 0; i < gCircles.length; i++) {
    if (i < gCircles.length - 1) {
      controlPoints.push(calculateControlPoints(gCircles[i], gCircles[i + 1], random(50, 100), random(50, 100)));
    }
  }

  gAllPathSegments = [];
  for (let i = 0; i < controlPoints.length; i++) {
    // calculate bezier segments between reference circles
    gAllPathSegments.push(new PathSegment(gCircles[i], controlPoints[i][0], controlPoints[i][1], gCircles[i + 1]));
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
  constructor(a0, c0, c1, a1) {
    this.anchor0 = a0;
    this.control0 = c0;
    this.control1 = c1;
    this.anchor1 = a1;
    this.gameSpaceDivs = [];
  }
}
