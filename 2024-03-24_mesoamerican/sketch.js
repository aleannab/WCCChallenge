// ______ by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Mesoamerican
//
//
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let isDebug = false;
let gOGSettings;

let gUnit;

function setup() {
  let l = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(windowWidth, windowHeight);
  gUnit = width / 100;
  noLoop();
  strokeWeight(3);
}

function draw() {
  background(255);

  let unit = 0.7 * width;
  let theta = TWO_PI / 10;
  let r = 0.1 * width;
  for (let i = 0; i < 10; i++) {
    push();
    translate(width / 2, height / 2);
    let offset = random(TWO_PI);
    let xp = cos(theta * i + offset) * r;
    let yp = sin(theta * i + offset) * r;
    let c = new Shape(xp, yp, unit);
    c.draw();
    pop();

    unit *= random(0.8, 0.9);
    r += random(0.5, 1) * gUnit;
  }
}

function mouseClicked() {
  redraw();
}

class Shape {
  constructor(x, y, unit) {
    this.x = x;
    this.y = y;
    this.angle = random(TWO_PI);

    this.shapes = [];

    let r = getValue('gRadius') * unit;
    let n = getValue('gShapeNum', true);
    let angle = random() < 0.5 ? PI : TWO_PI;
    for (let i = 0; i < 3; i++) {
      this.shapes.push(this.createShape(r, n, angle));
      r *= 0.5;
      if (r < 10) break;
    }
  }

  createShape(r, n, angle) {
    let points = [];
    let angInc = angle / n;
    for (let i = 0; i < n; i++) {
      let theta = angInc * i;
      points.push(this.getPt(theta, r));
    }
    return points;
  }

  getPt(theta, r) {
    let newX = cos(theta) * r;
    let newY = sin(theta) * r;
    return createVector(newX, newY);
  }

  draw() {
    fill(0);
    stroke(255);

    push();
    translate(this.x, this.y);
    rotate(this.angle);
    for (let s of this.shapes) {
      beginShape();
      for (let pt of s) {
        vertex(pt.x, pt.y);
      }
      endShape(CLOSE);
    }

    pop();
  }
}
