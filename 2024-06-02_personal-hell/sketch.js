// Agoraphobic Paruresis by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: My Personal Hell
//
// I've thought about this before hahaha.
// My personal hell would be a movie theater.
// I'm sitting in the middle of the row, and I really need to pee.
// I try to make my way out inconspicuously,
// but everyone is getting annoyed at me since it's during an
// important part of the film and I'm interrupting their experience.
// The row is neverending.
// I'm forever inconveniencing people and having them get mad at me...
// while desperately still needing to pee.
//
// (This is why I like aisle seats hahahaha).
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

// Color Palettes
let gMePalette = ['#07D1D8', '#08D7DF', '#0ADDE5'];
let gBgPalette = ['#2f3127', '#3a3029', '#20201f'];
let gAudiencePalette = ['#820505', '#780404', '#8A0606'];

let gSeatColor = '#520013';

// let gVelocityScalar = 0.03;

let gMe;
let gRowsBg = [];
let gRowsFg = [];

let gSighs = [];
let gSighIndex = 0;
let gSorrys = [];
let gSorryIndex = 0;
let gBoo;

let gPlaySighTime;
let gPlaySorryTime;

let gSoundsOn;

let gAudienceSound;

function preload() {
  soundFormats('mp3', 'ogg');
  let sighs = [
    'cantbelieve00',
    'cmon00',
    'cmon01',
    'cmon02',
    'excuseyou00',
    'geez00',
    'getout00',
    'groan',
    'mmhm00',
    'omg00',
    'rightnow00',
    'sigh00',
    'sigh03',
    'sigh04',
    'sigh05',
    'sigh06',
    'sigh07',
    'sigh08',
    'sigh09',
    'ugh00',
    'ugh01',
    'ugh02',
    'what00',
  ];
  for (let s of sighs) {
    gSighs.push(loadSound(s));
  }
  gSighs = shuffle(gSighs);
  let sorrys = ['excuse00', 'excuse01', 'other00', 'other01', 'sorry00', 'sorry01', 'sorry02', 'sorry03', 'thanks00', 'thanks01'];
  for (let s of sorrys) {
    gSorrys.push(loadSound(s));
  }
  gSorrys = shuffle(gSorrys);
  gBoo = loadSound('boo');
  gAudienceSound = loadSound('hell-recording');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let div = 40;
  gUnit = height / div;
  let yMe = (div * 2) / 3 - 0.75;

  gMe = new Person(createVector(0.5 * width, gUnit * yMe));
  let yp = -2 * gUnit;
  let isOffset = false;
  let spacing = 2.3 * gUnit;
  let rowCount = height / spacing + 1;
  for (let i = 0; i < rowCount; i++) {
    let row0 = new Row(0, yp, isOffset);
    let row1 = new Row(width, yp, isOffset);
    if (yp < 0.65 * height) {
      gRowsBg.push(row0);
      gRowsBg.push(row1);
    } else {
      gRowsFg.push(row0);
      gRowsFg.push(row1);
    }
    yp += spacing;
    isOffset = !isOffset;
  }

  gSoundsOn = false;
  gPlaySorryTime = millis() + random(1000, 2000);
  gPlaySighTime = millis() + random(2000, 3000);
}

function draw() {
  background(gSeatColor);
  let time = millis();

  if (gSoundsOn) {
    if (time > gPlaySorryTime) {
      playSorry();
      gPlaySorryTime = time + random(3000, 5000);
    }
    if (time > gPlaySighTime) {
      playSigh();
      gPlaySighTime = time + random(3000, 6000);
    }
  }

  gRowsBg.forEach((row) => {
    row.drawRow(time);
  });

  gMe.drawPerson(time * gAngularVScalar);

  gRowsFg.forEach((row) => {
    row.drawRow(time);
  });

  console.log(frameRate());
}

function mouseClicked() {
  // gAudienceSound.play();
  if (!gSoundsOn) {
    gSoundsOn = true;
  } else if (!gBoo.isPlaying()) {
    gBoo.play();
  }
}

function playSorry() {
  gSorrys[gSorryIndex].play();
  gSorryIndex = (gSorryIndex + 1) % gSorrys.length;
  //if (gSorryIndex === 0) gSorrys = shuffle(gSorrys);
}
function playSigh() {
  gSighs[gSighIndex].play();
  gSighIndex = (gSighIndex + 1) % gSighs.length;
  //if (gSighIndex === 0) gSighs = shuffle(gSighs);
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
    this.rate = map(yp, 0, height, 0.02, 0.04);
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

    let yOffset = random(1.5 * gUnit);
    xp += random(-0.5, 0.5) * gUnit;
    let headHeight = 1.5 * gUnit;
    this.personHead = new SingleCircle(xp, yp - 1.5 * headHeight + yOffset, gUnit, headHeight, random(gAudiencePalette));
    let torsoWidth = 1.5 * gPartSize.torso.w;
    this.torso = new QuadBodyPart(
      createVector(xp - 0.5 * torsoWidth, yp - 0.8 * gPartSize.torso.h + yOffset),
      torsoWidth,
      gPartSize.torso.h * 2,
      random(gAudiencePalette)
    );
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
