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

let gCircles = [];
let gColumnCount = 5; //{ min: 11, max: 15 };
let gCirclePrecision = 0.4;
let gCircleOffset = 0.3;
let gCirclePtCount = 10;
let gRadiusScale = 0.5;

let gBgColor = '#ffffff';
let gPalette = [
  '#0A001A', // Black with a hint of purple
  '#000A1A', // Black with a hint of blue
  '#001A0A', // Black with a hint of green
  '#1A0A00', // Black with a hint of red
  '#1A0010', // Black with a hint of magenta
  '#0A1A1A', // Black with a hint of teal
  '#1A1A0A', // Black with a hint of olive
  '#0F0A1A', // Black with a hint of indigo
  '#1A0F0A', // Black with a hint of maroon
  '#0A1A0F', // Black with a hint of emerald
];

function setup() {
  const l = 0.95 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(l, l);

  angleMode(DEGREES);
  noStroke();

  init();
}

function draw() {
  background(gBgColor);

  for (let c of gCircles) {
    c.draw();
  }
}

function init() {
  const boxWidth = width / gColumnCount;
  const rowCount = floor(height / boxWidth);
  const radius = (gRadiusScale * boxWidth) / 2;

  gCircles = [];

  for (let col = 1; col < gColumnCount - 1; col++) {
    const x = (0.5 + col) * boxWidth;
    for (let row = 1; row < rowCount - 1; row++) {
      const y = (0.5 + row) * boxWidth;
      let circ = new ImperfectCircle({
        xp: x,
        yp: y,
        radius: radius,
        precision: gCirclePrecision,
        offset: gCircleOffset,
        color: random(gPalette),
        numPts: gCirclePtCount,
      });
      gCircles.push(circ);
    }
  }
}

class ImperfectCircle {
  constructor(data) {
    this.position = createVector(data.xp, data.yp);
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
    push();
    translate(this.position.x, this.position.y);
    rotate(this.rotation);

    scale(1.5, 1);
    fill(this.color);
    beginShape();
    for (let p of this.circlePts) {
      curveVertex(p.x, p.y);
    }
    endShape(CLOSE);
    pop();
  }
}
