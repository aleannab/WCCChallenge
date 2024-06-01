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
let gMePalette = ['#007FFF', '#00BFFF', '#1E90FF', '#5CACEE', '#87CEFA'];

let gBgPalette = ['#2f3127', '#3a3029', '#20201f'];
let gAudiencePalette = ['#820505', '#780404', '#8A0606'];

let gSeatColor = '#520013';

let gVelocityScalar = 0.03;

let gMe;
let gRowsBg = [];
let gRowsFg = [];

let gRandSeed;

function setup() {
  createCanvas(windowWidth, windowHeight);

  gUnit = height / 20;

  gMe = new Person(createVector(0.5 * width, 0.65 * height));
  let yp = -2 * gUnit;
  let isOffset = false;
  let spacing = 2.2 * gUnit;
  let rowCount = height / spacing + 1;
  for (let i = 0; i < rowCount; i++) {
    let row0 = new Row(0, yp, isOffset);
    let row1 = new Row(width, yp, isOffset);
    if (yp < 0.75 * height) {
      gRowsBg.push(row0);
      gRowsBg.push(row1);
    } else {
      gRowsFg.push(row0);
      gRowsFg.push(row1);
    }
    yp += spacing;
    isOffset = !isOffset;
  }

  //
}

function draw() {
  background(gSeatColor);
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
    let seatWidth = 3 * gUnit;
    let seatCount = floor(width / seatWidth);
    let spacing = width / (seatCount + 1);
    this.xp = xp + (isOffset ? spacing / 2 : 0);
    this.timeElapsed = millis();
    for (let i = 0; i < seatCount + 1; i++) {
      this.allSeats.push(new Seat(i * spacing, 0, seatWidth));
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
      seat.drawSeat();
    });
    pop();
    this.timeElapsed = time;
  }
}

class Seat {
  constructor(xp, yp, seatWidth) {
    this.seatBack = new SingleCircle(xp, yp, seatWidth, 4.5 * gUnit, gSeatColor);

    let headHeight = 1.5 * gUnit;
    this.personHead = new SingleCircle(xp, yp - 1.5 * headHeight, gUnit, headHeight, random(gAudiencePalette));
    // /pos: any, w: any, h: any, shouldRotate?: boolean, angleMin?: number, angleMax?: number): QuadBodyPart
    let torsoWidth = 1.5 * gPartSize.torso.w;
    this.torso = new QuadBodyPart(
      createVector(xp - 0.5 * torsoWidth, yp - 0.8 * gPartSize.torso.h),
      torsoWidth,
      gPartSize.torso.h,
      random(gAudiencePalette)
    ); ////{ x: -0.5 * gPartSize.torso.w, y: -1.1 * gPartSize.torso.h }, gPartSize.torso.w, gPartSize.torso.h);
  }

  drawSeat() {
    this.seatBack.drawCircle();
    this.torso.drawPart();
    this.personHead.drawCircle();
  }
}

function getRandomValues(count, range) {
  let offsets = [];
  for (let i = 0; i < count; i++) {
    offsets.push(random(-range, range));
  }
  return offsets;
}
