// Fragmented Square Puzzle by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Draggable
//
// Click and drag the pieces around to complete the square.
// Once completed, click again for new puzzle
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gTriangles = [];
let gSelected = null;
let gOffset = null;
let gSideLength;
let gAreaMin;
let gDifficulty = 1;

let gIsPuzzleDone = false;
let gIsWaiting = false;
let gScaleVar;
let gAlphaVar;
let gStart = false;

function setup() {
  createCanvas(windowWidth, windowHeight);

  colorMode(HSL, 100);
  strokeWeight(2);
  strokeJoin(BEVEL);
  rectMode(CENTER);

  gSideLength = min(windowWidth, windowHeight) * 0.6;

  initPuzzle();
}

function draw() {
  let puzzleCheck = true;
  for (let i = 0; i < gTriangles.length; i++) {
    if (!gTriangles[i].isStatic) {
      puzzleCheck = false;
      break;
    }
  }
  if (puzzleCheck) {
    // setTimeout(() => {
    gIsPuzzleDone = true;
    // }, 500);
  }
  background(95);
  noStroke();
  push();
  translate(width / 2, height / 2);
  fill(80);

  rect(0, 0, gSideLength);
  if (!gStart) return;
  if (gIsPuzzleDone) {
    scale(gScaleVar);
    gAlphaVar -= 1;
    gScaleVar += 0.01;
    if (!gIsWaiting && gAlphaVar <= 0) {
      gIsWaiting = true;
      setTimeout(() => {
        initPuzzle();
      }, 500);
    }
  } else if (gAlphaVar < 100) {
    gAlphaVar += 2;
  }

  gTriangles.forEach((triangle) => {
    triangle.draw();
  });

  pop();
}

function initPuzzle() {
  gIsWaiting = false;
  gIsPuzzleDone = false;
  gAlphaVar = -50;
  gScaleVar = 1;
  let totalArea = gSideLength * gSideLength;
  gAreaMin = totalArea / ++gDifficulty;
  gTriangles = [];

  let xOffset = -gSideLength / 2; //(windowWidth - gSideLength) / 2;
  let yOffset = -gSideLength / 2; //(windowHeight - gSideLength) / 2;

  // centered square points
  let p1 = createVector(xOffset, yOffset);
  let p2 = createVector(xOffset + gSideLength, yOffset);
  let p3 = createVector(xOffset, yOffset + gSideLength);
  let p4 = createVector(xOffset + gSideLength, yOffset + gSideLength);

  // split square into two triangles, and subdivide
  subdivide({ p1: p1, p2: p2, p3: p3 });
  subdivide({ p1: p2, p2: p3, p3: p4 });

  // set color and move to random position
  let hInc = 100 / gTriangles.length;
  let h = int(random(100));
  for (let i = 0; i < gTriangles.length; i++) {
    gTriangles[i].color = color(h, 80, 60);
    gTriangles[i].move();
    h = (h + hInc) % 100;
  }
}

function triangleArea(p1, p2, p3) {
  return abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
}

function subdivide(triangle) {
  // add triangle if size is small enough
  if (triangleArea(triangle.p1, triangle.p2, triangle.p3) < gAreaMin) {
    gTriangles.push(new Triangle(triangle.p1, triangle.p2, triangle.p3));
    return;
  }

  // otherwise triangle divide further
  let a = p5.Vector.lerp(triangle.p1, triangle.p2, random(0.1, 0.9));
  let b = p5.Vector.lerp(triangle.p2, triangle.p3, random(0.1, 0.9));
  let c = p5.Vector.lerp(triangle.p3, triangle.p1, random(0.1, 0.9));
  subdivide({ p1: triangle.p1, p2: a, p3: c });
  subdivide({ p1: triangle.p2, p2: b, p3: a });
  subdivide({ p1: triangle.p3, p2: c, p3: b });
  subdivide({ p1: a, p2: b, p3: c });
}

function containsPoint(triangle, px, py) {
  let b1 = sign(px, py, triangle.p1, triangle.p2) < 0.0;
  let b2 = sign(px, py, triangle.p2, triangle.p3) < 0.0;
  let b3 = sign(px, py, triangle.p3, triangle.p1) < 0.0;
  return b1 === b2 && b2 === b3;
}

function sign(px, py, p1, p2) {
  return (px - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (py - p2.y);
}

function mousePressed() {
  if (!gStart) gStart = true;
  let offsetX = width / 2;
  let offsetY = height / 2;
  for (let i = gTriangles.length - 1; i >= 0; i--) {
    if (gTriangles[i].isStatic) continue;
    let adjMouseX = mouseX - offsetX;
    let adjMouseY = mouseY - offsetY;

    if (containsPoint(gTriangles[i], adjMouseX, adjMouseY)) {
      gSelected = gTriangles.splice(i, 1)[0];
      gTriangles.push(gSelected);
      gOffset = createVector(adjMouseX, adjMouseY).sub(createVector(gSelected.cx, gSelected.cy));
      break;
    }
  }
}

function mouseDragged() {
  if (gSelected) {
    let offsetX = -width / 2;
    let offsetY = -height / 2;
    let dx = mouseX - gSelected.cx + offsetX;
    let dy = mouseY - gSelected.cy + offsetY;
    gSelected.move(dx, dy);
    gOffset = createVector(mouseX, mouseY).sub(createVector(gSelected.cx, gSelected.cy));
  }
}

function mouseReleased() {
  if (gSelected && gSelected.isStatic) {
    let lastItem = gTriangles.pop();
    gTriangles.unshift(lastItem);
  }
  gSelected = null;
}

class Triangle {
  constructor(p1, p2, p3) {
    this.ogP1 = p1;
    this.ogP2 = p2;
    this.ogP3 = p3;

    let centroid = createVector((p1.x + p2.x + p3.x) / 3, (p1.y + p2.y + p3.y) / 3);

    // Calculate max offsets to keep triangle within the canvas bounds
    let maxOffsetX = min(centroid.x, 0.8 * width - centroid.x);
    let maxOffsetY = min(centroid.y, 0.8 * height - centroid.y);

    // Add random offset within bounds
    let offset = createVector(random(-maxOffsetX, maxOffsetX), random(-maxOffsetY, maxOffsetY));
    this.p1 = p1.copy().add(offset);
    this.p2 = p2.copy().add(offset);
    this.p3 = p3.copy().add(offset);

    // recaluclate centroids
    this.cx = (this.p1.x + this.p2.x + this.p3.x) / 3;
    this.cy = (this.p1.y + this.p2.y + this.p3.y) / 3;

    this.isStatic = false;
  }

  move(dx, dy) {
    if (this.isStatic) return;
    this.p1.add(dx, dy);
    this.p2.add(dx, dy);
    this.p3.add(dx, dy);
    this.cx = (this.p1.x + this.p2.x + this.p3.x) / 3;
    this.cy = (this.p1.y + this.p2.y + this.p3.y) / 3;

    if (this.boundCheck(this.p1, this.ogP1) && this.boundCheck(this.p2, this.ogP2) && this.boundCheck(this.p3, this.ogP3)) {
      this.p1 = this.ogP1;
      this.p2 = this.ogP2;
      this.p3 = this.ogP3;
      this.isStatic = true;
    }
  }

  boundCheck(p1, p2) {
    return dist(p1.x, p1.y, p2.x, p2.y) < 50;
  }

  draw() {
    fill(hue(this.color), saturation(this.color), lightness(this.color), gAlphaVar);
    stroke(0, gAlphaVar);

    triangle(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
  }
}
