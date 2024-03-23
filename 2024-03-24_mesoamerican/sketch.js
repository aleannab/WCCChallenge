// ______ by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Mesoamerican
//
//
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let isDebug = false;
let gOGSettings;

let gCircles = [];
let gUnit;

function setup() {
  let l = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(windowWidth, windowHeight);
  gUnit = width / 10;
  noLoop();
  strokeWeight(3);
}

function draw() {
  gCircles = [];
  for (let i = 0; i < 10; i++) {
    gCircles.push(new Circle(random(width), random(height)));
  }

  background(255);

  for (let c of gCircles) {
    c.draw();
  }
}

function mouseClicked() {
  redraw();
}

class Circle {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.shapes = [];

    let r = getValue('gRadius') * gUnit;
    let n = getValue('gShapeNum', true);
    for (let i = 0; i < 3; i++) {
      this.shapes.push(this.createShape(r, n));
      r *= 0.5;
      if (r < 10) break;
    }
  }

  createShape(r, n) {
    let points = [];
    let angle = TWO_PI / n;
    for (let i = 0; i < n; i++) {
      let theta = angle * i;
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
    for (let s of this.shapes) {
      beginShape();
      for (let pt of s) {
        curveVertex(pt.x, pt.y);
      }
      endShape(CLOSE);
    }

    pop();
  }
}
