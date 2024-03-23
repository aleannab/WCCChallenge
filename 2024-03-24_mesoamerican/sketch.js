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
  let l = 0.95 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(l, l);
  gUnit = width / 100;
  noLoop();
  strokeWeight(5);
}

function draw() {
  background(255);

  let count = 5;
  let unit = width * 0.15;
  let theta = TWO_PI / count;
  let r = 0.1 * width;
  let inc = 50 / count;

  push();
  translate(width / 2, height / 2);
  for (let i = 0; i < count; i++) {
    let offset = random(TWO_PI);
    let xp = cos(theta * i + offset) * r;
    let yp = sin(theta * i + offset) * r;
    let c = new Shape(xp, yp, unit, random() < 0.5);
    c.draw();
    let c1 = new Shape(xp, yp, 0.5 * unit, true);
    c1.draw();

    unit -= inc;
    // r -= 0.1 * unit; //0.5 * unit; //random(0.1, 0.6) * unit;
  }
  pop();
}

function mouseClicked() {
  redraw();
}

class Shape {
  constructor(x, y, unit, isCirc) {
    this.x = x;
    this.y = y;
    this.angle = random(TWO_PI);

    this.shapes = [];

    let r = unit; // getValue('gRadius') * unit;
    let n = getValue('gShapeNum', true);
    let angle = random() < 0.5 ? PI : TWO_PI;
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
    let scalars = [
      createVector(-random(), -random(0.5)),
      createVector(-random(), random(0.5)),
      createVector(random(), random(0.5)),
      createVector(random(), -random(0.5)),
    ];

    for (let i = 0; i < 4; i++) {
      points.push(createVector(l * scalars[i].x, l * scalars[i].y));
    }

    let dividedLines = [];
    let count = ~~random(5);
    let inc = 1 / (count + 1);
    let isVert = random() < 0.5;
    for (let i = 0; i < count; i++) {
      if (isVert) {
        let xp = inc * (i + 1);
        let x0 = map(xp, 0, 1, points[0].x, points[3].x);
        let y0 = map(xp, 0, 1, points[0].y, points[3].y);
        let x1 = map(xp, 0, 1, points[1].x, points[2].x);
        let y1 = map(xp, 0, 1, points[1].y, points[2].y);
        dividedLines.push([x0, y0, x1, y1]);
      } else {
        let xp = inc * (i + 1);
        let x0 = map(xp, 0, 1, points[0].x, points[1].x);
        let y0 = map(xp, 0, 1, points[0].y, points[1].y);
        let x1 = map(xp, 0, 1, points[3].x, points[2].x);
        let y1 = map(xp, 0, 1, points[3].y, points[2].y);
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
    fill(0);
    stroke(255);

    push();
    translate(this.x, this.y);
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
