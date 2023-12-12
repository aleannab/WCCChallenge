let gLeftPt;
let gRightPt;

let gUpperSections = [];
let gMidSections = [];
let gLowerSections = [];

let gWallDistMin = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  gLeftPt = new c2.Vector(0.1 * windowWidth, 0.7 * windowHeight);

  gRightPt = new c2.Vector(0.9 * windowWidth, 0.7 * windowHeight);

  let yp = windowHeight * 0.1;
  for (let i = 0; i < 20; i++) {
    let section = new WallSection(yp);
    if (section.level > 0) gUpperSections.push(section);
    else if (section.level < 0) gLowerSections.push(section);
    else gMidSections.push(section);
    yp += random(25, 100);
  }
  console.log(gUpperSections.length + ' ' + gMidSections.length + ' ' + gLowerSections.length);
  noFill();
}

// Create a draw function
function draw() {
  background(255);

  // perspective lines
  stroke(200);
  strokeWeight(1);
  line(0, gLeftPt.y, width, gRightPt.y);
  stroke(255, 0, 0);
  circle(gLeftPt.x, gLeftPt.y, 10);
  circle(gRightPt.x, gRightPt.y, 10);

  for (let section of gUpperSections) {
    section.draw();
  }

  for (let section of gLowerSections) {
    section.draw();
  }

  for (let section of gMidSections) {
    section.draw();
  }
}

class WallSection {
  constructor(yp) {
    let centerUpperPt = new c2.Vector(random(0.3, 0.7) * width, yp);
    let centerLowerPt = new c2.Vector(centerUpperPt.x, centerUpperPt.y - random(50, 300));
    this.centerLine = new Line(centerUpperPt, centerLowerPt);

    // left side
    this.leftUpperBoundLine = new Line(centerUpperPt, gLeftPt);
    this.leftLowerBoundLine = new Line(centerLowerPt, gLeftPt);
    let leftPosX = floor(random(gLeftPt.x + gWallDistMin, centerUpperPt.x - gWallDistMin));
    this.leftCornerLine = this.getCornerLine(leftPosX, this.leftUpperBoundLine, this.leftLowerBoundLine);

    // right side
    this.rightUpperBoundLine = new Line(centerUpperPt, gRightPt);
    this.rightLowerBoundLine = new Line(centerLowerPt, gRightPt);
    let rightPosX = floor(random(centerUpperPt.x + gWallDistMin, gRightPt.x - gWallDistMin));
    this.rightCornerLine = this.getCornerLine(rightPosX, this.rightUpperBoundLine, this.rightLowerBoundLine);

    // ceiling
    this.leftCeilingBoundLine = new Line(this.leftCornerLine.p1, gRightPt);
    this.rightCeilingBoundLine = new Line(this.rightCornerLine.p1, gLeftPt);
    this.ceilingPt = this.getIntersectionPt(this.leftCeilingBoundLine, this.rightCeilingBoundLine);

    //floor
    this.leftFloorBoundLine = new Line(this.leftCornerLine.p0, gRightPt);
    this.rightFloorBoundLine = new Line(this.rightCornerLine.p0, gLeftPt);
    this.floorPt = this.getIntersectionPt(this.leftFloorBoundLine, this.rightFloorBoundLine);

    let leftQuad = [this.leftCornerLine.p0, this.centerLine.p0, this.centerLine.p1, this.leftCornerLine.p1];
    let rightQuad = [this.centerLine.p0, this.rightCornerLine.p0, this.rightCornerLine.p1, this.centerLine.p1];
    let bottomQuad = [this.leftCornerLine.p0, this.centerLine.p0, this.rightCornerLine.p0, this.floorPt];
    let topQuad = [this.leftCornerLine.p1, this.centerLine.p1, this.rightCornerLine.p1, this.ceilingPt];

    if (centerUpperPt.y > gLeftPt.y && centerLowerPt.y > gLeftPt.y) {
      this.allQuads = [topQuad, leftQuad, rightQuad];
      this.level = 1;
    } else if (centerUpperPt.y < gLeftPt.y && centerLowerPt.y < gLeftPt.y) {
      this.allQuads = [leftQuad, rightQuad, bottomQuad];
      this.level = -1;
    } else {
      this.allQuads = [leftQuad, rightQuad];
      this.level = 0;
    }
    this.color = color(random(0, 360), 50, 200);
  }

  getCornerLine(ptX, upperBound, lowerBound) {
    let upperIntersection = this.getIntersectionPtWithConstant(ptX, upperBound);
    let lowerIntersection = this.getIntersectionPtWithConstant(ptX, lowerBound);

    return new Line(upperIntersection, lowerIntersection);
  }

  getIntersectionPtWithConstant(constant, line) {
    let x = constant;
    let y = line.p0.y + ((constant - line.p0.x) * (line.p1.y - line.p0.y)) / (line.p1.x - line.p0.x);

    return new c2.Vector(x, y);
  }

  getIntersectionPt(line0, line1) {
    let x = (line1.yIntercept - line0.yIntercept) / (line0.slope - line1.slope);
    let y = line0.slope * x + line0.yIntercept;
    return new c2.Vector(x, y);
  }

  draw() {
    stroke(255, 0, 0);
    strokeWeight(0.5);

    //perspective bounds left and right
    stroke(hue(this.color), saturation(this.color), brightness(this.color), 100);
    this.leftUpperBoundLine.draw();
    this.leftLowerBoundLine.draw();
    this.rightUpperBoundLine.draw();
    this.rightLowerBoundLine.draw();

    // stroke(255, 0, 0);
    this.leftFloorBoundLine.draw();
    this.rightFloorBoundLine.draw();

    stroke(255);
    this.leftCornerLine.draw();
    this.rightCornerLine.draw();

    // top and bottom points of center corner.
    stroke(0);
    // this.centerLine.draw();

    fill(this.color);
    for (let side of this.allQuads) {
      quad(side[0].x, side[0].y, side[1].x, side[1].y, side[2].x, side[2].y, side[3].x, side[3].y);
    }
  }
}

class Line {
  constructor(p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
    this.slope = p0.x === p1.x ? 0 : (p1.y - p0.y) / (p1.x - p0.x);
    this.yIntercept = this.p0.y - this.slope * this.p0.x;
  }

  draw() {
    line(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
  }
}
