let gLeftPt;
let gRightPt;

let gAllBlocks = [];

let gWallDistMin = 50;

let gIsDebug = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  gLeftPt = new c2.Vector(0.1 * windowWidth, 0.7 * windowHeight);

  gRightPt = new c2.Vector(0.9 * windowWidth, 0.7 * windowHeight);

  let yp = windowHeight * 0.1;
  let upper = [];
  let mid = [];
  let lower = [];
  for (let i = 0; i < 20; i++) {
    let block = new BuildingBlock(yp);
    if (block.level > 0) upper.push(block);
    else if (block.level < 0) lower.push(block);
    else mid.push(block);
    yp += random(25, 100);
  }

  gAllBlocks = [...upper, ...lower, ...mid];
  noFill();
}

// Create a draw function
function draw() {
  background(255);

  // perspective lines
  strokeWeight(1); // draw horizon line
  line(0, gLeftPt.y, width, gRightPt.y);
  if (gIsDebug) {
    // draw perspective pts
    stroke(255, 0, 0);
    circle(gLeftPt.x, gLeftPt.y, 10);
    circle(gRightPt.x, gRightPt.y, 10);
  }

  // draw building sections
  for (let block of gAllBlocks) {
    block.draw();
  }
}

class BuildingBlock {
  constructor(yp) {
    this.boundLines = [];
    // center corner
    let centerUpperPt = new c2.Vector(random(0.3, 0.7) * width, yp);
    let centerLowerPt = new c2.Vector(centerUpperPt.x, centerUpperPt.y - random(50, 300));
    this.centerLine = new Line(centerUpperPt, centerLowerPt);

    // left side
    let leftPosX = floor(random(gLeftPt.x + gWallDistMin, centerUpperPt.x - gWallDistMin));
    this.leftCornerLine = this.getCornerLine(leftPosX, this.centerLine, gLeftPt);

    // right side
    let rightPosX = floor(random(centerUpperPt.x + gWallDistMin, gRightPt.x - gWallDistMin));
    this.rightCornerLine = this.getCornerLine(rightPosX, this.centerLine, gRightPt);

    // ceiling
    this.ceilingPt = this.getIntersectionPt(new Line(this.leftCornerLine.p1, gRightPt), new Line(this.rightCornerLine.p1, gLeftPt), true);

    //floor
    this.floorPt = this.getIntersectionPt(new Line(this.leftCornerLine.p0, gRightPt), new Line(this.rightCornerLine.p0, gLeftPt), true);

    let leftWall = new Wall(this.leftCornerLine.p0, this.centerLine.p0, this.centerLine.p1, this.leftCornerLine.p1);
    let rightWall = new Wall(this.centerLine.p0, this.rightCornerLine.p0, this.rightCornerLine.p1, this.centerLine.p1);
    let floorWall = new Wall(this.leftCornerLine.p0, this.centerLine.p0, this.rightCornerLine.p0, this.floorPt);
    let ceilingWall = new Wall(this.leftCornerLine.p1, this.centerLine.p1, this.rightCornerLine.p1, this.ceilingPt);

    if (centerUpperPt.y > gLeftPt.y && centerLowerPt.y > gLeftPt.y) {
      this.allWalls = [ceilingWall, leftWall, rightWall];
      this.level = 1;
    } else if (centerUpperPt.y < gLeftPt.y && centerLowerPt.y < gLeftPt.y) {
      this.allWalls = [leftWall, rightWall, floorWall];
      this.level = -1;
    } else {
      this.allWalls = [leftWall, rightWall];
      this.level = 0;
    }
    this.color = color(random(0, 360), 50, 200);
  }

  getCornerLine(ptX, line, perspectivePt) {
    let boundLines = [new Line(line.p0, perspectivePt), new Line(line.p1, perspectivePt)];
    this.boundLines.push(...boundLines);

    let intersections = boundLines.map((boundLine) => this.getIntersectionPtWithConstant(ptX, boundLine));
    return new Line(...intersections);
  }

  getIntersectionPtWithConstant(constant, line) {
    let x = constant;
    let y = line.p0.y + ((constant - line.p0.x) * (line.p1.y - line.p0.y)) / (line.p1.x - line.p0.x);

    return new c2.Vector(x, y);
  }

  getIntersectionPt(line0, line1, shouldAddToBoundLines = false) {
    if (shouldAddToBoundLines) this.boundLines.push(...[line0, line1]);
    let x = (line1.yIntercept - line0.yIntercept) / (line0.slope - line1.slope);
    let y = line0.slope * x + line0.yIntercept;
    return new c2.Vector(x, y);
  }

  draw() {
    stroke(255, 0, 0);
    strokeWeight(0.5);

    if (true) this.drawBoundLines();

    fill(this.color);
    for (let wall of this.allWalls) {
      stroke(0);
      wall.draw();
    }
  }

  drawBoundLines() {
    stroke(hue(this.color), saturation(this.color), brightness(this.color), 100);
    for (let bound of this.boundLines) {
      bound.draw();
    }
  }
}

class Wall {
  constructor(p0, p1, p2, p3) {
    Object.assign(this, { p0, p1, p2, p3 });
  }

  draw() {
    quad(this.p0.x, this.p0.y, this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
  }
}

class Line {
  constructor(p0, p1) {
    Object.assign(this, { p0, p1 });
    this.slope = p0.x === p1.x ? 0 : (p1.y - p0.y) / (p1.x - p0.x);
    this.yIntercept = this.p0.y - this.slope * this.p0.x;
  }

  draw() {
    line(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
  }
}
