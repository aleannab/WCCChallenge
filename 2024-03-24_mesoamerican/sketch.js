// Xolotl by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Chalchiuhtlicue (or Mesoamerican design)
//
// This is an abstract piece inspired by this illustration I found of the Aztec god Xolotl.
// https://cdn1.vectorstock.com/i/1000x1000/29/15/aztec-gods-xolotl-vector-46352915.jpg
//
// I also played around with color, which I kinda liked... but something still feels off for me.
// Toggle color mode by pressing 'c'
//
// I need to fix the placement of the dots for the semi-circles. They currently go outside the shape since I'm drawing the whole ring (more apparent in color mode).
// Adding a little more detail would be nice (e.g. dots on the quads, pinwheel lines on the circles, etc from the inspo pictures).
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gUnit;
let gUnitScalar = 0.07; // size of one unit proportional to height
let gMainCount = 5; // initial branches from (central) shape
let gBranchCount = 2; // max branches from child shapes
let gMinScalar = 0.4; // min size for branching to occur

let gShapes;
let gStrokeWidth = 5;

let gBgColor = '#f8f3e3';
let gPalette = ['#58b4c9', '#b4b472', '#b1141c', '#ecc35f', '#e38c29'];
let gIsColor = false;
// let gPalette = ['#8D5A06', '#3F2C12', '#2E0C09', '#263129'];

function setup() {
  let h = windowHeight < windowWidth ? windowHeight : 0.707 * windowWidth;
  let w = windowHeight < windowWidth ? 1.414 * windowHeight : windowWidth;
  createCanvas(0.95 * w, 0.95 * h);
  gUnit = gUnitScalar * height;
  // noLoop();
  strokeWeight(gStrokeWidth);
  fill(0);
  stroke(gBgColor);
  initShapes();
}

function draw() {
  background(gBgColor);
  gShapes.draw();
}

function initShapes() {
  gShapes = new Shape(width / 2, height / 2, gUnit, true, 0);
}

class Shape {
  constructor(x, y, unit, isCirc, level, angle = -1) {
    this.seed = ~~random(99999);
    this.isCirc = isCirc;
    this.level = level;
    this.pos = createVector(x, y);
    this.angle = angle != -1 ? angle : random(TWO_PI);
    this.mainShape = [];
    this.childShapes = [];

    // create primary shape
    let a = isCirc ? random(1, 2) : random(2, 4);
    this.r = a * unit;

    if (isCirc) {
      this.createRingedCircle(this.r);
    } else {
      this.mainShape.push(this.createQuad(this.r));
    }

    // add child shapes
    if (unit > gMinScalar * gUnit && level < 10) {
      let childCount = level === 0 ? gMainCount : ~~random(2, gBranchCount);
      let theta = max(random(QUARTER_PI, TWO_PI) / childCount, QUARTER_PI);

      for (let i = 0; i < childCount; i++) {
        let offset = random(0.25);
        let xp = a * cos(theta * i + offset) * unit;
        let yp = a * sin(theta * i + offset) * unit;
        this.childShapes.push(new Shape(xp, yp, random(0.6, 0.9) * unit, getBool(), level + 1, theta * i));
      }
    }
  }

  createRingedCircle(r) {
    let circCount = ~~random(3) + 1;
    let cAngle = getBool() ? PI : TWO_PI;
    for (let i = 0; i < circCount; i++) {
      this.mainShape.push(this.createCircle(r, cAngle));
      r *= random(0.5, 0.6);
      if (r < 4 * gStrokeWidth) break;
    }
  }
  createCircle(r, angle) {
    let points = [];
    let angInc = angle / 50;
    for (let i = 0; i < 50; i++) {
      let theta = angInc * i;
      points.push(this.getPt(theta, r));
    }
    return { vertices: points, lines: [] };
  }

  createQuad(r) {
    let points = [];
    let w0 = random(0.1, 0.4);
    let w1 = random(0.3, 0.5);
    let scalars = [createVector(0, -w0), createVector(0, w0), createVector(1, w1), createVector(1, -w1)];

    for (let i = 0; i < 4; i++) {
      points.push(createVector(r * scalars[i].x, r * scalars[i].y));
    }

    let dividedLines = [];
    if (r * w0 > gStrokeWidth) {
      let count = ~~random(2) + 1;
      let inc = 1 / (count + 1);
      let isVert = getBool();
      for (let i = 0; i < count; i++) {
        let xp = inc * (i + 1 + random(0.5));
        let x0, y0, x1, y1;
        if (isVert) {
          x0 = map(xp, 0, 1, points[0].x, points[3].x);
          y0 = map(xp, 0, 1, points[0].y, points[3].y);
          x1 = map(xp, 0, 1, points[1].x, points[2].x);
          y1 = map(xp, 0, 1, points[1].y, points[2].y);
        } else {
          x0 = map(xp, 0, 1, points[0].x, points[1].x);
          y0 = map(xp, 0, 1, points[0].y, points[1].y);
          x1 = map(xp, 0, 1, points[3].x, points[2].x);
          y1 = map(xp, 0, 1, points[3].y, points[2].y);
        }
        dividedLines.push([x0, y0, x1, y1]);
      }
    }

    return { vertices: points, lines: dividedLines };
  }

  getPt(theta, r) {
    let newX = cos(theta) * r;
    let newY = sin(theta) * r;
    return createVector(newX, newY);
  }

  draw() {
    if (!gIsColor) strokeWeight(random(2, 6));
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    fill(0);
    this.drawChildren();
    this.drawMain();
    if (this.isCirc && this.r > 0.6 * gUnit) this.drawRing();

    pop();
  }

  drawMain() {
    randomSeed(this.seed);
    if (gIsColor) stroke(0);
    for (let s of this.mainShape) {
      fill(gIsColor ? random(gPalette) : 0);
      beginShape();
      for (let pt of s.vertices) {
        vertex(pt.x, pt.y);
      }
      endShape(CLOSE);
      for (let pt of s.lines) {
        line(pt[0], pt[1], pt[2], pt[3]);
      }
    }
  }

  drawChildren() {
    for (let cs of this.childShapes) {
      cs.draw();
    }
  }

  drawRing() {
    if (!gIsColor) noStroke();
    fill(gBgColor);

    let count = ~~random(3, 11);
    let theta = TWO_PI / count;
    let r = gIsColor ? map(count, 3, 11, 15, 10) : map(count, 3, 11, 10, 3); //random(3, 10);
    for (let i = 0; i < count; i++) {
      let angle = theta * i;
      let xp = 0.75 * this.r * cos(angle);
      let yp = 0.75 * this.r * sin(angle);
      push();
      translate(xp, yp);
      ellipse(0, 0, r);
      pop();
    }
  }
}

function getBool() {
  return random() < 0.5;
}

function mouseClicked() {
  initShapes();
  redraw();
}

function keyPressed() {
  if (key == 'c') {
    gIsColor = !gIsColor;
    if (gIsColor) strokeWeight(3);
  }
}
