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
  strokeWeight(5);
}

function draw() {
  background(255);

  let count = 5;
  let unit = (0.5 * width) / count;
  let theta = TWO_PI / count;
  let r = 0.1 * width;

  push();
  translate(width / 2, height / 2);
  for (let i = 0; i < count; i++) {
    let offset = 0; //random(TWO_PI);
    let xp = cos(theta * i + offset) * r;
    let yp = sin(theta * i + offset) * r;
    let c = new Shape(xp, yp, unit);
    c.draw();

    unit *= 0.9;
    r -= 0.1 * unit; //random(0.1, 0.6) * unit;
  }
  pop();
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

    let r = unit; // getValue('gRadius') * unit;
    let n = getValue('gShapeNum', true);
    let angle = random() < 0.5 ? PI : TWO_PI;
    let isCirc = random() < 0.5;
    if (isCirc) {
      for (let i = 0; i < 3; i++) {
        this.shapes.push(this.createCircle(r, n, angle));
        r *= 0.5;
        if (r < 10) break;
      }
    } else {
      this.shapes.push(this.createQuad(r, n, angle));
    }
  }

  createCircle(r, n, angle) {
    let points = [];
    let angInc = angle / n;
    for (let i = 0; i < n; i++) {
      let theta = angInc * i;
      points.push(this.getPt(theta, r));
    }
    return { vertices: points, lines: [] };
  }

  createQuad(r) {
    let l = r * 2;
    let points = [];
    let scalars = [createVector(0, -0.1), createVector(0, 0.1), createVector(1, 0.25), createVector(1, -0.25)];

    for (let i = 0; i < 4; i++) {
      points.push(createVector(l * scalars[i].x, l * scalars[i].y));
    }
    console.log(points);

    // Draw horizontal lines to divide the quad
    let dividedLines = [];
    let count = 3;
    let inc = 1 / (count + 1);
    for (let i = 0; i < count; i++) {
      let xp = (i + 1) * inc * l;
      let y0 = map(xp, 0, l, points[0].y, points[3].y);
      let y1 = map(xp, 0, l, points[1].y, points[2].y);
      dividedLines.push([xp, y0, xp, y1]);
    }

    return { vertices: points, lines: dividedLines };
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
    //translate(this.x, this.y);
    rotate(this.angle);
    for (let s of this.shapes) {
      beginShape();
      for (let pt of s.vertices) {
        vertex(pt.x, pt.y);
      }
      endShape(CLOSE);
      for (let pt of s.lines) {
        line(pt[0], pt[1], pt[2], pt[3]);
      }
    }

    pop();
  }
}
