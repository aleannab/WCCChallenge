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
let gRow;

let gRandSeed;

function setup() {
  createCanvas(windowWidth, windowHeight);

  gUnit = height / 20;

  gMe = new Person(createVector(width / 2, height / 2));
  gRow = new Row();
}

function draw() {
  background(gBgPalette[2]);
  time = millis() * gAngularVScalar;

  gRow.drawRow();

  gMe.drawPerson(time);
}

function getRandomValues(count, range) {
  let offsets = [];
  for (let i = 0; i < count; i++) {
    offsets.push(random(-range, range));
  }
  return offsets;
}

class Row {
  constructor() {
    this.allSeats = [];
    let seatWidth = 2 * gUnit;
    let seatCount = floor(width / seatWidth);
    let spacing = width / seatCount;
    for (let i = 0; i < seatCount + 1; i++) {
      this.allSeats.push(new SketchCircle(true, i * spacing, 0, 2 * gUnit, 3 * gUnit, '#762c38'));
    }
  }

  drawRow() {
    push();
    translate(0, height / 2);
    this.allSeats.forEach((seat) => {
      seat.drawSketchCircle();
    });
    pop();
  }
}
