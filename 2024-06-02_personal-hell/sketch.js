// Created for the #WCCChallenge - Topic: Cubism
// Inspired by Marcel Duchamp's Nude Descending a Staircase, No. 2
//
// Abstract figures are created using bezier curves and quads.
// The sketchy outlines are drawn by randomly offsetting the control points of the shape
// Forward movement and rotation transformations for each body part give the illusion of walking
// Once figure is offscreen, they are moved back to the top of the "staircase"
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

// Color Palettes
let gColorPalette = ['#004F8B', '#00BFFF', '#2A52BE', '#4682B4', '#1E90FF'];
let gBgPalette = ['#2f3127', '#3a3029', '#20201f'];

let gVelocityScalar = 0.03;

let gMe;
let gRowsBg = [];
let gRowsFg = [];

let gRandSeed;

function setup() {
  createCanvas(windowWidth, windowHeight);

  gUnit = height / 20;

  gMe = new Person(createVector(width / 2, height / 2));
  let yp = 0;
  let isOffset = false;
  let rowCount = height / 80 + 1;
  for (let i = 0; i < rowCount; i++) {
    let row0 = new Row(0, yp, isOffset);
    let row1 = new Row(width, yp, isOffset);
    if (yp < height / 2) {
      gRowsBg.push(row0);
      gRowsBg.push(row1);
    } else {
      gRowsFg.push(row0);
      gRowsFg.push(row1);
    }
    yp += 75;
    isOffset = !isOffset;
  }

  //
}

function draw() {
  background(gBgPalette[2]);
  time = millis();

  gRowsBg.forEach((row) => {
    row.drawRow(time);
  });

  gMe.drawPerson(time * gAngularVScalar);

  gRowsFg.forEach((row) => {
    row.drawRow(time);
  });
}

class Row {
  constructor(xp, yp, isOffset) {
    this.allSeats = [];
    this.yp = yp;
    let seatWidth = 2 * gUnit;
    let seatCount = floor(width / seatWidth);
    let spacing = width / seatCount;
    this.xp = xp + (isOffset ? spacing / 2 : 0);
    this.timeElapsed = millis();
    for (let i = 0; i < seatCount + 1; i++) {
      this.allSeats.push(new SingleCircle(i * spacing, 0, 2 * gUnit, 3 * gUnit, '#762c38'));
    }
    this.rate = map(yp, 0, height, 0.01, 0.04);
  }

  drawRow(time) {
    let t = time - this.timeElapsed;
    if (this.xp < -width) {
      this.xp = width;
    }
    this.xp -= this.rate * t;
    push();
    translate(this.xp, this.yp);
    this.allSeats.forEach((seat) => {
      seat.drawCircle();
    });
    pop();
    this.timeElapsed = time;
  }
}

function getRandomValues(count, range) {
  let offsets = [];
  for (let i = 0; i < count; i++) {
    offsets.push(random(-range, range));
  }
  return offsets;
}
