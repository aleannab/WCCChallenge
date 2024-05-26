let gCircles = [];

let gPalette = ['#ea0319', '#981183', '#f3e022', '#03a3ee', '#f28b31', '#79d29d'];

let gMaskLayer;

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (4 * windowHeight) / 3;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.9 * w, 0.9 * h);
  let xp = 0;
  let yp = 50;
  let rowCount = 5;
  let colCount = 2;
  let hSpacingMax = 0.9 * (width / (colCount - 1));
  let vSpacing = height / rowCount;
  for (let row = 0; row < rowCount; row++) {
    let isRowOdd = row % 2 != 0;
    let hSpacing = isRowOdd ? -hSpacingMax : hSpacingMax;
    for (let col = 0; col < colCount; col++) {
      gCircles.push(createVector(xp, yp + random(-1, 1) * vSpacing * 0.25));
      xp += random(0.5, 0.9) * hSpacing;
    }
    xp = isRowOdd ? 50 : width - 50;
    yp += vSpacing;
  }

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.erase();

  gMaskLayer.stroke(0);
  gMaskLayer.strokeWeight(30);
  gMaskLayer.noFill();
  noStroke();
}

function draw() {
  background(255);
  gMaskLayer.background('#ffffff');

  // draw debug circles
  let controlPoints = [];
  for (let i = 0; i < gCircles.length; i++) {
    circle(gCircles[i].x, gCircles[i].y, 50);
    if (i < gCircles.length - 1) {
      controlPoints.push(calculateControlPoints(gCircles[i], gCircles[i + 1], 100, 100));
    }
  }
  // Draw bezier path
  let colorIndex = 0;
  let prevPos = createVector(0, 0);

  for (let i = 0; i < controlPoints.length; i++) {
    let x1 = gCircles[i].x;
    let y1 = gCircles[i].y;
    let x2 = controlPoints[i][0].x;
    let y2 = controlPoints[i][0].y;
    let x3 = controlPoints[i][1].x;
    let y3 = controlPoints[i][1].y;
    let x4 = gCircles[i + 1].x;
    let y4 = gCircles[i + 1].y;
    gMaskLayer.bezier(x1, y1, x2, y2, x3, y3, x4, y4);
    let percentComplete = 0;
    while (percentComplete <= 1) {
      let x = bezierPoint(x1, x2, x3, x4, percentComplete);
      let y = bezierPoint(y1, y2, y3, y4, percentComplete);
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
}

function calculateControlPoints(start, end, offsetX, offsetY) {
  let controlPoint1 = createVector(start.x + offsetX, start.y + offsetY);
  let controlPoint2 = createVector(end.x - offsetX, end.y - offsetY);
  return [controlPoint1, controlPoint2];
}
