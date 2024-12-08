// A Clowder of Voids by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Void
//
// SOUND ON!
//
// Pretty self-explanatory on how this relates to the topic haha.
// I definitely giggled a lot making this.
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gVoids = [];
let gColumnCount = 4; //{ min: 11, max: 15 };
let gCirclePrecision = 0.4;
let gCircleOffset = 0.3;
let gCirclePtCount = 10;
let gRadiusScale = 0.6;

let gBgColor = '#ffffff';
let gPalette = ['#0A001A'];
let gEyeColor = '#ddd927';

function setup() {
  const l = 0.95 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(l, l);

  angleMode(DEGREES);
  noStroke();

  init();
}

function draw() {
  background(gBgColor);

  for (let c of gVoids) {
    c.draw();
  }
}

function init() {
  const boxWidth = width / gColumnCount;
  const rowCount = floor(height / boxWidth);
  const radius = (gRadiusScale * boxWidth) / 2;
  strokeWeight(0.01 * boxWidth);

  gVoids = [];

  for (let col = 1; col < gColumnCount - 1; col++) {
    const x = (0.5 + col) * boxWidth;
    for (let row = 1; row < rowCount - 1; row++) {
      const y = (0.5 + row) * boxWidth;
      let circ = new Cat({
        xp: x,
        yp: y,
        radius: radius,
        precision: gCirclePrecision,
        offset: gCircleOffset,
        color: random(gPalette),
        numPts: gCirclePtCount,
      });
      gVoids.push(circ);
    }
  }
}

class Cat {
  constructor(data) {
    this.position = createVector(data.xp, data.yp);
    this.body = new ImperfectCircle(data);
    this.bodyScale = createVector(random(1, 1.5), random(1, 1.5));
    this.headData = {
      position: createVector(0.4 * data.radius, -1 * data.radius),
      rotation: random(360), //-80, 80),
      radius: 0.6 * data.radius,
      precision: 2 * gCirclePrecision,
      offset: 0.5 * gCircleOffset,
      color: 0,
      numPts: gCirclePtCount,
    };
    this.head = new CatHead(this.headData);
  }

  draw() {
    push();
    translate(this.position.x, this.position.y);

    push();
    scale(this.bodyScale.x, this.bodyScale.y);
    this.body.draw();
    pop();
    push();
    rotate(this.headData.rotation);

    translate(this.headData.position.x, this.headData.position.y);
    this.head.draw();
    pop();
    pop();
  }
}

class CatHead {
  constructor(data) {
    this.head = new ImperfectCircle(data);

    this.earPts = [
      createVector(-0.4 * data.radius, 0), // base0
      createVector(0.4 * data.radius, 0), // base1
      createVector(0, -1.2 * data.radius), // tip
    ];
    const earOffset = createVector(-0.5 * data.radius, -0.4 * data.radius);
    const earRotation = 20;
    this.earPositions = [
      { offset: earOffset, rotation: -earRotation }, // Left ear
      { offset: createVector(-earOffset.x, earOffset.y), rotation: earRotation }, // Right ear
    ];

    const eyeOffset = createVector(-0.3 * data.radius, -0.2 * data.radius);
    this.eyePositions = [eyeOffset, createVector(-eyeOffset.x, eyeOffset.y)];
    this.eyeSize = 0.45 * data.radius;
  }

  draw() {
    this.head.draw();

    for (let ear of this.earPositions) {
      push();
      translate(ear.offset.x, ear.offset.y);
      rotate(ear.rotation);
      this.drawEar();
      pop();
    }

    stroke(gEyeColor);
    for (let eyePosition of this.eyePositions) {
      push();
      translate(eyePosition);
      ellipse(0, 0, this.eyeSize, this.eyeSize);
      pop();
    }
    noStroke();
  }

  // Function to draw an ear (a triangle)
  drawEar() {
    triangle(this.earPts[0].x, this.earPts[0].y, this.earPts[1].x, this.earPts[1].y, this.earPts[2].x, this.earPts[2].y); // Base and tip of the triangle
  }
}

class ImperfectCircle {
  constructor(data) {
    this.color = data.color;
    this.rotation = random(360);

    this.circlePts = this.createCircle(data);
  }

  createCircle(data) {
    let points = [];
    let n = data.numPts;
    let angle = n <= 0 ? 360 : 360 / n;
    for (let i = 0; i < n; i++) {
      let newX = (cos(angle * i) + random() * data.offset) * data.radius;
      let newY = (sin(angle * i) + random() * data.offset) * data.radius;
      points.push(createVector(newX, newY));
    }

    return points;
  }

  draw() {
    fill(this.color);

    beginShape();
    for (let p of this.circlePts) {
      curveVertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}
