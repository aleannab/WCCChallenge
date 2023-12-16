let gLeftPt;
let gRightPt;

let gAllBlocks = [];
let gBgGround = [];
let gBgSky = [];

let gDistFromPointMin;
let gWallHeightInc;
let gWallDistMin;

let gWindowLength;
let gWindowSpacing;
let gIsDebug = false;

let gWindowColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL);

  gWindowColor = color(0, 0.1);
  // set points for two point perspective calculations
  gLeftPt = new c2.Vector(0, 0.6 * windowHeight);
  gRightPt = new c2.Vector(windowWidth, 0.6 * windowHeight);
  gDistFromPointMin = windowWidth * 0.2;
  gWallDistMin = windowWidth * 0.1;

  // create background elements
  for (let i = 0; i < 50; i++) {
    gBgGround.push(new c2.Vector(random(-width, 2 * width), random(gLeftPt.y, height)));
    gBgSky.push(new c2.Vector(random(-width, 2 * width), random(-0.2 * height, gLeftPt.y)));
  }

  // create and stack building blocks
  let yp = 0.95 * height;
  let [upper, mid, lower] = [[], [], []];
  let count = random(20, 30);
  gWallHeightInc = (0.7 * height) / count;
  gWindowHeight = 0.4 * gWallHeightInc;
  gWindowLength = 0.5 * gWallHeightInc;
  gWindowSpacingX = 0.2 * gWindowLength;
  gWindowSpacingY = 0.5 * gWindowHeight;
  for (let i = 0; i < count; i++) {
    let block = new BuildingBlock(yp);
    block.level > 0 ? upper.push(block) : block.level < 0 ? lower.push(block) : mid.push(block);
    yp -= random(0.8, 1.2) * gWallHeightInc;
  }

  // adjust array for rendering purposes
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
    fill(random(30, 35), 0, 60, 0.05);
    triangle(ground.x, ground.y, gLeftPt.x, gLeftPt.y, gRightPt.x, gRightPt.y);
  }

  for (let sky of gBgSky) {
    fill(random(180, 250), 60, 80, 0.2);
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

  // draw building blocks
  for (let block of gAllBlocks) {
    block.draw();
  }
}

function getIntersectionPtWithConstant(constant, line) {
  let x = constant;
  let y = line.p0.y + ((constant - line.p0.x) * (line.p1.y - line.p0.y)) / (line.p1.x - line.p0.x);

  return new c2.Vector(x, y);
}

class BuildingBlock {
  constructor(yp) {
    // lines that connect to perspective point (drawn for debug mode)
    this.boundLines = [];

    // center corner
    const centerUpperPt = new c2.Vector(random(2 * gDistFromPointMin, width - 2 * gDistFromPointMin), yp);
    const centerLowerPt = new c2.Vector(centerUpperPt.x, centerUpperPt.y - random(0.5, 2.5) * gWallHeightInc);
    const centerLine = new Line(centerUpperPt, centerLowerPt);
    const centerLineHeight = centerUpperPt.y - centerLowerPt.y;

    // left side
    const leftPosX = random(gLeftPt.x + gDistFromPointMin, centerUpperPt.x - gWallDistMin);
    const leftCornerLine = this.getCornerLine(leftPosX, centerLine, gLeftPt);

    // right side
    const rightPosX = floor(random(centerUpperPt.x + gWallDistMin, gRightPt.x - gDistFromPointMin));
    const rightCornerLine = this.getCornerLine(rightPosX, centerLine, gRightPt);

    // ceiling
    const ceilingPt = this.getIntersectionPt(new Line(leftCornerLine.p1, gRightPt), new Line(rightCornerLine.p1, gLeftPt), true);
    const floorPt = this.getIntersectionPt(new Line(leftCornerLine.p0, gRightPt), new Line(rightCornerLine.p0, gLeftPt), true);

    // pick a color
    const cHue = random(0, 360);
    const cSat = 40;
    const cLig = 80;

    // create walls
    const createWall = (points, colorMultiplier, hasWindows) => new Wall(points, color(cHue, cSat, cLig * colorMultiplier), hasWindows);
    const ceilingWall = createWall([leftCornerLine.p1, centerLine.p1, rightCornerLine.p1, ceilingPt], 1.0, false);
    const leftWall = createWall([leftCornerLine.p1, leftCornerLine.p0, centerLine.p0, centerLine.p1], 0.9, true);
    const rightWall = createWall([centerLine.p1, centerLine.p0, rightCornerLine.p0, rightCornerLine.p1], 0.8, true);
    const floorWall = createWall([leftCornerLine.p0, centerLine.p0, rightCornerLine.p0, floorPt], 0.7, false);

    // order walls for rendering purposes
    const isAboveLeftPt = centerUpperPt.y > gLeftPt.y && centerLowerPt.y > gLeftPt.y;
    const isBelowLeftPt = centerUpperPt.y < gLeftPt.y && centerLowerPt.y < gLeftPt.y;
    if (isAboveLeftPt) {
      this.allWalls = [ceilingWall, leftWall, rightWall];
      this.level = 1;
    } else if (isBelowLeftPt) {
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

    let intersections = boundLines.map((boundLine) => getIntersectionPtWithConstant(ptX, boundLine));
    return new Line(...intersections);
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
  constructor(points, c, hasWindows = false) {
    this.allPoints = points;
    this.color = c;

    this.allWindows = [];
    if (hasWindows) {
      // calculate window parameters (size is based on how close wall is to center)
      const heightL = abs(this.allPoints[1].y - this.allPoints[0].y);
      const heightR = abs(this.allPoints[2].y - this.allPoints[3].y);
      const isHeightLMax = heightL > heightR;
      let heightMax;
      let posXMax;
      if (isHeightLMax) {
        heightMax = heightL;
        posXMax = this.allPoints[0].x;
      } else {
        heightMax = heightR;
        posXMax = this.allPoints[2].x;
      }

      const windowSizeScalar = 1 - abs(posXMax - width / 2) / (width / 2);
      const windowHeight = windowSizeScalar * gWindowHeight;
      const windowLength = windowSizeScalar * gWindowLength;
      const windowSpacingX = windowSizeScalar * gWindowSpacingX;
      const windowSpacingY = windowSizeScalar * gWindowSpacingY;
      const ratioWindowToWall = windowHeight / heightMax;
      const windowCount = floor(heightMax / (windowHeight + windowSpacingY)) - 1;

      if (windowCount > 0) {
        const windowHeightL = isHeightLMax ? windowHeight : ratioWindowToWall * heightL;
        const windowHeightR = isHeightLMax ? ratioWindowToWall * heightR : windowHeight;

        const spaceAvailable = heightL - windowHeightL * windowCount;
        const extraInc = spaceAvailable / windowCount;

        const percentInc = (extraInc + windowHeightL) / heightL;
        let percent = (0.5 * extraInc) / heightL;
        const wallDistance = this.allPoints[3].x - this.allPoints[0].x;
        const initPos = this.allPoints[3].x - windowSpacingY * 0.5;
        const wallLength = abs(wallDistance);
        const sign = wallDistance < 0 ? 1 : -1;

        const windowColCount = floor(wallLength / (windowLength + windowSpacingX)) - 2;
        const windowSpaceAvailable = wallLength - windowColCount * windowLength;
        const windowInc = windowSpaceAvailable / windowColCount + windowLength;

        console.log(this.allPoints[0]);
        console.log(this.allPoints[1]);
        console.log(this.allPoints[2]);
        console.log(this.allPoints[3]);
        console.log(' ');

        for (let i = 0; i < windowCount; i++) {
          const adj1y = lerp(this.allPoints[1].y, this.allPoints[0].y, percent);
          const adj0y = adj1y - windowHeightL;
          const adj2y = lerp(this.allPoints[2].y, this.allPoints[3].y, percent);
          const adj3y = adj2y - windowHeightR;

          const topWindowLine = new Line(new c2.Vector(this.allPoints[0].x, adj0y), new c2.Vector(this.allPoints[3].x, adj3y));
          const bottomWindowLine = new Line(new c2.Vector(this.allPoints[2].x, adj2y), new c2.Vector(this.allPoints[1].x, adj1y));
          this.createWindow(topWindowLine, bottomWindowLine, windowLength, windowColCount, windowInc, sign, initPos);
          // this.allWindows.push([adj0y, adj1y, adj2y, adj3y]);
          percent += percentInc;
        }
      }
    }
  }

  createWindow(topWindowLine, bottomWindowLine, windowSize, windowColCount, windowInc, sign, initPos) {
    for (let j = 0; j < windowColCount; j++) {
      const position0 = sign * j * windowInc + initPos;
      const position1 = position0 + sign * windowSize;
      const wpt0 = getIntersectionPtWithConstant(position0, bottomWindowLine);
      const wpt1 = getIntersectionPtWithConstant(position0, topWindowLine);
      const wpt2 = getIntersectionPtWithConstant(position1, topWindowLine);
      const wpt3 = getIntersectionPtWithConstant(position1, bottomWindowLine);
      this.allWindows.push([wpt0, wpt1, wpt2, wpt3]);
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
      quad(window[0].x, window[0].y, window[1].x, window[1].y, window[2].x, window[2].y, window[3].x, window[3].y);
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
