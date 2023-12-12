let gLeftPt;
let gRightPt;
let gWallSections = [];

let gWallDistMin = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);

  gLeftPt = new c2.Vector(0.1 * windowWidth, 0.7 * windowHeight);

  gRightPt = new c2.Vector(0.9 * windowWidth, 0.7 * windowHeight);

  for (let i = 0; i < 20; i++) {
    gWallSections.push(new WallSection());
  }
  noFill();
}

// Create a draw function
function draw() {
  //background(255);

  // perspective lines
  stroke(200);
  strokeWeight(1);
  line(0, gLeftPt.y, width, gRightPt.y);
  stroke(255, 0, 0);
  circle(gLeftPt.x, gLeftPt.y, 10);
  circle(gRightPt.x, gRightPt.y, 10);

  for (let section of gWallSections) {
    section.draw();
  }
}

class WallSection {
  constructor() {
    let centerUpperPt = new c2.Vector(random(0.3, 0.7) * width, random(0.2, 0.8) * height);
    let centerLowerPt = new c2.Vector(centerUpperPt.x, centerUpperPt.y - random(50, 200));
    this.centerLine = new Line(centerUpperPt, centerLowerPt);

    // left side
    this.leftUpperBoundLine = new Line(centerUpperPt, gLeftPt);
    this.leftLowerBoundLine = new Line(centerLowerPt, gLeftPt);
    let leftPosX = floor(random(gLeftPt.x + gWallDistMin, centerUpperPt.x - gWallDistMin));
    this.leftCornerLine = this.getCornerLine(leftPosX, this.leftUpperBoundLine, this.leftLowerBoundLine);
    this.rightUpperBoundLine = new Line(centerUpperPt, gRightPt);
    this.rightLowerBoundLine = new Line(centerLowerPt, gRightPt);
    let rightPosX = floor(random(centerUpperPt.x + gWallDistMin, gRightPt.x - gWallDistMin));
    this.rightCornerLine = this.getCornerLine(rightPosX, this.rightUpperBoundLine, this.rightLowerBoundLine);

    this.allCorners = [this.leftCornerLine, this.centerLine, this.rightCornerLine];
    this.color = color(0, random(100, 200), random(200, 255));
  }

  getCornerLine(ptX, upperBound, lowerBound) {
    let upperIntersection = this.getIntersectionPt(ptX, upperBound);
    let lowerIntersection = this.getIntersectionPt(ptX, lowerBound);

    return new Line(upperIntersection, lowerIntersection);
  }

  getIntersectionPt(constant, line) {
    let x = constant;
    let y = line.p0.y + ((constant - line.p0.x) * (line.p1.y - line.p0.y)) / (line.p1.x - line.p0.x);

    return new c2.Vector(x, y);
  }

  draw() {
    stroke(255, 0, 0);
    strokeWeight(0.5);

    //perspective bounds left and right
    // stroke(0, 255, 0);
    // this.leftUpperBoundLine.draw();
    // this.leftLowerBoundLine.draw();
    // this.rightUpperBoundLine.draw();
    // this.rightLowerBoundLine.draw();

    stroke(255);
    this.leftCornerLine.draw();
    this.rightCornerLine.draw();

    // top and bottom points of center corner.
    stroke(255);
    this.centerLine.draw();

    fill(this.color);
    for (let i = 0; i < this.allCorners.length - 1; i++) {
      let current = this.allCorners[i];
      let next = this.allCorners[i + 1];
      quad(current.p0.x, current.p0.y, current.p1.x, current.p1.y, next.p1.x, next.p1.y, next.p0.x, next.p0.y);
    }
  }
}

class Line {
  constructor(p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
    this.slope = p0.x === p1.x ? 0 : (p1.y - p0.y) / (p1.x - p0.x);
    this.yIntercept = this.p0.x - this.slope * this.p1.x;
  }

  draw() {
    line(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
  }
}
