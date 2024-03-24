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
let gShapes;

function setup() {
  let l = 0.95 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(windowWidth, l);
  gUnit = width / 20;
  noLoop();
  strokeWeight(5);
  fill(0);
  stroke(255);
  initShapes();
}

function draw() {
  background(255);

  gShapes.draw();

  // let count = 1;
  // let unit = width * 0.1;
  // let theta = TWO_PI / count;
  // let r = 0.1 * width;
  // let inc = 50 / count;

  // push();
  // translate(width / 2, height / 2);
  // for (let i = 0; i < count; i++) {
  //   let offset = random(TWO_PI);
  //   let xp = cos(theta * i + offset) * r;
  //   let yp = sin(theta * i + offset) * r;
  //   push();
  //   translate(xp, yp);

  //   let c = new Shape(xp, yp, unit, random() < 0.5);

  //   let sCount = ~~random(5) + 1;
  //   let thInc = TWO_PI / sCount;
  //   for (let j = 0; j < sCount; j++) {
  //     push();
  //     rotate(thInc * j);
  //     c.draw();
  //     pop();
  //     if (random() < 0.5) break;
  //   }
  //   pop();

  //   unit -= inc;
  //   r += 0.05 * unit; //0.5 * unit; //random(0.1, 0.6) * unit;
  // }
  // pop();
}

function initShapes() {
  gShapes = new Shape(width / 2, height / 2, gUnit, true, 0);
}

class Shape {
  constructor(x, y, unit, isCirc, level, angle = -1) {
    this.pos = createVector(x, y);
    this.angle = angle != -1 ? angle : random(TWO_PI);
    this.mainShape = [];
    this.childShapes = [];

    let n = getValue('gShapeNum', true);
    let a;
    if (isCirc) {
      let circCount = ~~random(3) + 1;
      a = 2;
      let r = a * unit;
      for (let i = 0; i < circCount; i++) {
        this.mainShape.push(this.createCircle(r, n, TWO_PI));
        r *= random(0.3, 0.6);
        if (r < 10) break;
      }
    } else {
      a = random(1, 5);
      let r = a * unit;
      this.mainShape.push(this.createQuad(r, n, angle));
    }

    let childCount = 1; //~~random(2) + 1;
    if (level < 3) {
      let theta = random(QUARTER_PI, TWO_PI) / childCount;

      for (let i = 0; i < childCount; i++) {
        let offset = 0; //random(TWO_PI);
        let xp = a * cos(theta * i + offset) * unit;
        let yp = a * sin(theta * i + offset) * unit;
        this.childShapes.push(new Shape(xp, yp, 0.8 * unit, false, level + 1, theta * i));
      }
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
    let l = r;
    let points = [];
    let w0 = random(0.25);
    let w1 = random(0.5);
    let h = 1; //random(0.5, 1);
    let offset = random(0.2);
    let scalars = [createVector(0, -w0), createVector(0, w0), createVector(h, w1), createVector(h, -w1)];

    for (let i = 0; i < 4; i++) {
      points.push(createVector(l * scalars[i].x, l * scalars[i].y));
    }

    let dividedLines = [];
    let count = ~~random(5);
    let inc = 1 / (count + 1);
    let isVert = random() < 0.5;
    for (let i = 0; i < count; i++) {
      let xp = inc * (i + 1);
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

    return { vertices: points, lines: dividedLines };
  }

  getPt(theta, r) {
    let newX = cos(theta) * r;
    let newY = sin(theta) * r;
    return createVector(newX, newY);
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    for (let cs of this.childShapes) {
      cs.draw();
    }

    for (let s of this.mainShape) {
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

function mouseClicked() {
  initShapes();
  redraw();
}
