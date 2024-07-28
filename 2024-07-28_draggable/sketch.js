// Tangram by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Draggable
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gShapes = [];
let gSelected = null;
let gOffset = null;
let gSideLength;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 100);

  rectMode(CENTER);

  gSideLength = min(windowWidth, windowHeight) * 0.6;
  let xOffset = (windowWidth - gSideLength) / 2;
  let yOffset = (windowHeight - gSideLength) / 2;

  let p1 = createVector(xOffset, yOffset);
  let p2 = createVector(xOffset + gSideLength, yOffset);
  let p3 = createVector(xOffset, yOffset + gSideLength);
  let p4 = createVector(xOffset + gSideLength, yOffset + gSideLength);

  subdivide({ p1: p1, p2: p2, p3: p3 });
  subdivide({ p1: p2, p2: p3, p3: p4 });

  gShapes.forEach((shape) => {
    shape.move();
  });
}

function draw() {
  background(0);
  fill(25);
  rect(width / 2, height / 2, gSideLength, gSideLength);
  for (let i = 0; i < gShapes.length; i++) {
    gShapes[i].draw();
  }
}

function randomColor() {
  return color(random(0, 8), random(30, 60), random(20, 100));
}

function triangleArea(p1, p2, p3) {
  return abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
}

function subdivide(shape) {
  let minArea = 200 * gSideLength;
  if (triangleArea(shape.p1, shape.p2, shape.p3) < minArea) {
    gShapes.push(new Shape(shape.p1, shape.p2, shape.p3));
    return;
  }

  let a = p5.Vector.lerp(shape.p1, shape.p2, random(0.1, 0.9));
  let b = p5.Vector.lerp(shape.p2, shape.p3, random(0.1, 0.9));
  let c = p5.Vector.lerp(shape.p3, shape.p1, random(0.1, 0.9));
  subdivide({ p1: shape.p1, p2: a, p3: c });
  subdivide({ p1: shape.p2, p2: b, p3: a });
  subdivide({ p1: shape.p3, p2: c, p3: b });
  subdivide({ p1: a, p2: b, p3: c });
}

function containsPoint(shape, px, py) {
  let b1 = sign(px, py, shape.p1, shape.p2) < 0.0;
  let b2 = sign(px, py, shape.p2, shape.p3) < 0.0;
  let b3 = sign(px, py, shape.p3, shape.p1) < 0.0;
  return b1 === b2 && b2 === b3;
}

function sign(px, py, p1, p2) {
  return (px - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (py - p2.y);
}

function mousePressed() {
  for (let i = gShapes.length - 1; i >= 0; i--) {
    if (containsPoint(gShapes[i], mouseX, mouseY)) {
      gSelected = gShapes.splice(i, 1)[0];
      gShapes.push(gSelected);
      gOffset = createVector(mouseX, mouseY).sub(createVector(gSelected.cx, gSelected.cy));
      break;
    }
  }
}

function mouseDragged() {
  if (gSelected) {
    let dx = mouseX - gOffset.x - gSelected.cx;
    let dy = mouseY - gOffset.y - gSelected.cy;
    gSelected.move(dx, dy);
    gOffset = createVector(mouseX, mouseY).sub(createVector(gSelected.cx, gSelected.cy));
  }
}

function mouseReleased() {
  gSelected = null;
}

class Shape {
  constructor(p1, p2, p3) {
    this.ogP1 = p1;
    this.ogP2 = p2;
    this.ogP3 = p3;

    let centroid = createVector((p1.x + p2.x + p3.x) / 3, (p1.y + p2.y + p3.y) / 3);

    // Calculate max offsets to keep shape within the canvas bounds
    let maxOffsetX = min(centroid.x, width - centroid.x);
    let maxOffsetY = min(centroid.y, height - centroid.y);

    // Add random offset within bounds
    let offset = createVector(random(-maxOffsetX, maxOffsetX), random(-maxOffsetY, maxOffsetY));
    this.p1 = p1.copy().add(offset);
    this.p2 = p2.copy().add(offset);
    this.p3 = p3.copy().add(offset);

    // recaluclate centroids
    this.cx = (this.p1.x + this.p2.x + this.p3.x) / 3;
    this.cy = (this.p1.y + this.p2.y + this.p3.y) / 3;

    this.color = randomColor();
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
    return dist(p1.x, p1.y, p2.x, p2.y) < 10;
  }

  draw() {
    push();
    fill(this.color);
    triangle(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    pop();
  }
}
