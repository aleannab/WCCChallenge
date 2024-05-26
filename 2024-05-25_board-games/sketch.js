let gCircles = [];

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (4 * windowHeight) / 3;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.9 * w, 0.9 * h);
  let xp = 0;
  let yp = 50;
  let rowCount = 7;
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
}

function draw() {
  background(255);

  // draw circles
  noFill();
  stroke(0);
  let controlPoints = [];
  for (let i = 0; i < gCircles.length; i++) {
    circle(gCircles[i].x, gCircles[i].y, 50);
    if (i < gCircles.length - 1) {
      controlPoints.push(calculateControlPoints(gCircles[i], gCircles[i + 1], 100, 100));
    }
  }
  // Draw bezier path
  noFill();
  stroke(0, 0, 255);
  for (let i = 0; i < controlPoints.length; i++) {
    bezier(
      gCircles[i].x,
      gCircles[i].y,
      controlPoints[i][0].x,
      controlPoints[i][0].y,
      controlPoints[i][1].x,
      controlPoints[i][1].y,
      gCircles[i + 1].x,
      gCircles[i + 1].y
    );
  }
}

function calculateControlPoints(start, end, offsetX, offsetY) {
  let controlPoint1 = createVector(start.x + offsetX, start.y + offsetY);
  let controlPoint2 = createVector(end.x - offsetX, end.y - offsetY);
  return [controlPoint1, controlPoint2];
}
