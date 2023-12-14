let gLeftPt;
let gRightPt;

let gAllBlocks = [];
let gBgGround = [];
let gBgSky = [];

let gDistFromPointMin;
let gWallHeightInc;

let gWindowHeight;
let gIsDebug = false;

let gWindowColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL);

  gWindowColor = color(0, 0.1);
  // set points for two point perspective calculations
  gLeftPt = new c2.Vector(0, 0.6 * windowHeight);
  gRightPt = new c2.Vector(windowWidth, 0.6 * windowHeight);
  gDistFromPointMin = windowWidth * 0.3;

  let yp = 0.95 * height;
  let [upper, mid, lower] = [[], [], []];
  let count = random(10, 30);
  gWallHeightInc = (0.7 * height) / count;
  gWindowHeight = 0.8 * gWallHeightInc;
  for (let i = 0; i < count; i++) {
    let block = new BuildingBlock(yp);
    block.level > 0 ? upper.push(block) : block.level < 0 ? lower.push(block) : mid.push(block);
    yp -= random(0.8, 1.2) * gWallHeightInc;
  }

  for (let i = 0; i < 50; i++) {
    if (i < 10) gBgGround.push(new c2.Vector(random(-width, 2 * width), random(gLeftPt.y, height)));
    gBgSky.push(new c2.Vector(random(-width, 2 * width), random(-0.2 * height, gLeftPt.y)));
  }

  gAllBlocks = [...upper, ...lower.reverse(), ...mid.reverse()];

  noFill();
  noLoop();
}

// Create a draw function
function draw() {
  background(90);

  // draw background
  noStroke();
  for (let ground of gBgGround) {
    fill(random(30, 35), 20, 40, 0.05);
    triangle(ground.x, ground.y, gLeftPt.x, gLeftPt.y, gRightPt.x, gRightPt.y);
  }

  for (let sky of gBgSky) {
    fill(random(180, 250), 60, 80, 0.05);
    triangle(sky.x, sky.y, gLeftPt.x, gLeftPt.y, gRightPt.x, gRightPt.y);
  }

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
    const centerUpperPt = new c2.Vector(random(2 * gDistFromPointMin, width - 2 * gDistFromPointMin), yp);
    const centerLowerPt = new c2.Vector(centerUpperPt.x, centerUpperPt.y - random(0.5, 2.5) * gWallHeightInc);
    const centerLine = new Line(centerUpperPt, centerLowerPt);
    const centerLineHeight = centerUpperPt.y - centerLowerPt.y;

    // left side
    const leftPosX = random(gLeftPt.x + gDistFromPointMin, centerUpperPt.x - gDistFromPointMin);
    const leftCornerLine = this.getCornerLine(leftPosX, centerLine, gLeftPt);

    // right side
    const rightPosX = floor(random(centerUpperPt.x + gDistFromPointMin, gRightPt.x - gDistFromPointMin));
    const rightCornerLine = this.getCornerLine(rightPosX, centerLine, gRightPt);

    // ceiling
    const ceilingPt = this.getIntersectionPt(new Line(leftCornerLine.p1, gRightPt), new Line(rightCornerLine.p1, gLeftPt), true);
    const floorPt = this.getIntersectionPt(new Line(leftCornerLine.p0, gRightPt), new Line(rightCornerLine.p0, gLeftPt), true);

    const cHue = random(0, 360);
    const cSat = 40;
    const cLig = 80;
    const adjWindowHeight = (1 - abs(centerUpperPt.x - width / 2) / (width / 2)) * gWindowHeight;
    const windowCount = floor(centerLineHeight / adjWindowHeight) - 1;

    const ceilingWall = new Wall([leftCornerLine.p1, centerLine.p1, rightCornerLine.p1, ceilingPt], color(cHue, cSat, cLig));
    const leftWall = new Wall(
      [leftCornerLine.p0, centerLine.p0, centerLine.p1, leftCornerLine.p1],
      color(cHue, cSat, cLig * 0.9),
      windowCount,
      centerLineHeight,
      adjWindowHeight
    );
    const rightWall = new Wall(
      [rightCornerLine.p0, centerLine.p0, centerLine.p1, rightCornerLine.p1],
      color(cHue, cSat, cLig * 0.8),
      windowCount,
      centerLineHeight,
      adjWindowHeight
    );
    const floorWall = new Wall([leftCornerLine.p0, centerLine.p0, rightCornerLine.p0, floorPt], color(cHue, cSat, cLig * 0.7));

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

    if (gIsDebug) this.drawBoundLines();

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
  constructor(points, c, windowCount = 0, wallHeight = 0, windowHeight = 0) {
    this.allPoints = points;
    this.color = c;

    this.allWindows = [];
    if (windowCount > 0) {
      const farHeight = this.allPoints[0].y - this.allPoints[3].y;
      const windowPercent = windowHeight / wallHeight;

      const spaceAvailable = wallHeight - windowHeight * windowCount;
      const extraInc = spaceAvailable / windowCount;

      const adjWindowHeight = farHeight * windowPercent;
      const percentInc = (extraInc + windowHeight) / wallHeight;
      let percent = (0.5 * extraInc) / wallHeight;
      for (let i = 0; i < windowCount; i++) {
        const adj0y = lerp(this.allPoints[0].y, this.allPoints[3].y, percent);
        const adj1y = lerp(this.allPoints[1].y, this.allPoints[2].y, percent);
        const adj2y = adj1y - windowHeight;
        const adj3y = adj0y - adjWindowHeight;
        this.allWindows.push([adj0y, adj1y, adj2y, adj3y]);
        percent += percentInc;
      }
    }
  }

  draw() {
    fill(this.color);
    strokeWeight(1);
    quad(
      this.allPoints[0].x,
      this.allPoints[0].y,
      this.allPoints[1].x,
      this.allPoints[1].y,
      this.allPoints[2].x,
      this.allPoints[2].y,
      this.allPoints[3].x,
      this.allPoints[3].y
    );

    fill(gWindowColor);
    strokeWeight(0.5);
    for (let window of this.allWindows) {
      quad(this.allPoints[0].x, window[0], this.allPoints[1].x, window[1], this.allPoints[2].x, window[2], this.allPoints[3].x, window[3]);
    }
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
