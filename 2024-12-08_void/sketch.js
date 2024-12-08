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
let gColumnCount = 5; //{ min: 11, max: 15 };
let gCirclePrecision = 0.4;
let gCircleOffset = 0.3;
let gCirclePtCount = 10;
let gRadiusScale = 0.5;

let gBgColor = '#ffffff';
let gPalette = ['#0A001A'];

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
      position: createVector(-0.5 * data.radius, -0.5 * data.radius),
      rotation: random(-30, 30),
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
    translate(this.headData.position.x, this.headData.position.y);
    rotate(this.headData.rotation);
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
    this.earOffset = createVector(-0.5 * data.radius, -0.4 * data.radius);
    this.earRotation = 20;
  }

  draw() {
    this.head.draw();
    // color(255);
    // Draw left ear
    push();
    translate(this.earOffset.x, this.earOffset.y); // Move to the left ear position
    rotate(-this.earRotation); // Slight rotation for natural ear angle
    this.drawEar();
    pop();

    // Draw right ear
    push();
    translate(-this.earOffset.x, this.earOffset.y); // Move to the right ear position
    rotate(this.earRotation); // Slight rotation for natural ear angle
    this.drawEar();
    pop();
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
