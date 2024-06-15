// Created for the #Genuary2024 - In the style of Anni Albers (1899-1994).
// https://genuary.art/prompts#jan11
// Inspired by Anni Albers, Dotted, 1959

let gRopeStrings = [];
let gRopeCount;
let gRopeSpacing = 50;
let gKnotRad = 5;

let gColorPalette = ['#c1b3a6', '#f2e9e3'];
let gKnotPalette = ['#c1b3a6'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  strokeWeight(1);

  createMacrameHanging();
}

function createMacrameHanging() {
  gRopeCount = floor(width / gRopeSpacing) + 1;

  for (let i = 0; i < gRopeCount; i++) {
    for (let j = 0; j < 2; j++) {
      gRopeStrings.push(new RopeString(i * gRopeSpacing + j * 10, -50, height + 100));
    }
  }
}

function draw() {
  noStroke();
  background(50);

  gRopeStrings.forEach((rope) => {
    rope.draw();
  });
}

class RopeString {
  constructor(xp, yp, l) {
    this.pos = createVector(xp, yp);
    this.length = l;
    this.color = random(gColorPalette);
    this.knots = [];

    let knotCount = 10;
    let spacing = this.length / (knotCount - 1);
    let x = this.pos.x;
    for (let i = 0; i < knotCount; i++) {
      this.knots.push(new Knot(x, this.pos.y + spacing * i));
      x = x + (random() < 0.5 ? -gRopeSpacing : gRopeSpacing);

      if (x < 0) x += 2 * gRopeSpacing;
      else if (x > width) x -= 2 * gRopeSpacing;
    }
  }

  draw() {
    stroke(this.color);
    strokeWeight(4);
    noFill();
    beginShape();
    curveVertex(this.knots[0].pos.x, this.knots[0].pos.y);
    this.knots.forEach((knot) => {
      curveVertex(knot.pos.x, knot.pos.y);
    });
    curveVertex(this.knots[this.knots.length - 1].pos.x, this.knots[this.knots.length - 1].pos.y);
    endShape();

    // beginShape();
    // curveVertex(this.pos.x, this.knots[0].pos.y);
    // this.knots.forEach((knot) => {
    //   curveVertex(this.pos.x, knot.pos.y);
    // });
    // curveVertex(this.pos.x, this.knots[0].pos.y);
    // endShape();

    this.knots.forEach((knot) => {
      knot.draw();
    });
  }
}

class Knot {
  constructor(xp, yp) {
    this.randSeed = xp * yp;
    this.c = random(0, 1) > 0.7 ? gKnotPalette[0] : random(gKnotPalette);
    this.pos = createVector(xp, yp);
    this.vertices = [];
    let offset = 0.5 * gKnotRad;
    let vCount = 5;
    let angleInc = 360 / vCount;

    for (let i = 0; i < vCount; i++) {
      let angle = radians(angleInc * i);
      let adjRad = gKnotRad + random(0, offset);
      let xp = adjRad * cos(angle);
      let yp = adjRad * sin(angle);
      this.vertices.push(createVector(xp, yp));
    }
  }

  draw() {
    randomSeed(this.randSeed);
    strokeWeight(4);
    stroke(this.c);
    noFill();
    push();
    translate(this.pos.x, this.pos.y);
    for (let i = 0; i < 50; i++) {
      stroke(hue(this.c), saturation(this.c) + random(-5, 5), brightness(this.c) + random(-10, 10));
      let v0 = random(this.vertices);
      let v1 = random(this.vertices);
      line(v0.x, v0.y, v1.x, v1.y);
    }
    pop();
  }
}
