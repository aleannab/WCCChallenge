// AYFKMRN by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Nope
//
// SOUND ON!
//
// Pretty self-explanatory on how this relates to the topic haha.
// I definitely giggled a lot making this.
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let isDebug = false;
let gOGSettings;

let gCircles = [];
let gCount = 11;
let gBoxWidth;
let gHoverRadius;
let gDamping;

let gSounds = [];
let gReallySound;

let gReallyOdds = 0.01;
let gNopeCount = 0;

let gBgColor = '#E7E1CD';
let gPalettes = [
  ['#A34B4B', '#c14d8d', '#b54a7f', '#a24a6a', '#4c343d', '#703a4b', '#2f0e27', '#3a1329', '#200c1f'],
  ['#4B6BA3', '#4EB8C2', '#4AA7B5', '#4B8CA3', '#34464D', '#3A5F70', '#0E2E2A', '#13383B', '#0C211B'],
  ['#4B9DA3', '#4EC28A', '#4AB587', '#4BA389', '#344D46', '#3A7064', '#0E2E18', '#133B28', '#0C210F'],
];
let gPaletteIndex = 0;
let gPalette = gPalettes[0];

function preload() {
  soundFormats('mp3', 'ogg');
  let nopes = ['nope00', 'nope01', 'nope02', 'nope03'];
  for (let n of nopes) {
    let sound = loadSound(n);
    sound.setVolume(0.5);
    gSounds.push(sound);
  }
  gReallySound = loadSound('really');
}

function setup() {
  let l = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(windowWidth, windowHeight);
  noStroke();

  if (isDebug) {
    initPanel();
    gOGSettings = settings.map((obj) => deepCopy(obj));
  }

  createNewArt();
}

function draw() {
  background(gBgColor);

  hoverCheck();

  for (let c of gCircles) {
    c.draw();
  }
}

function createNewArt() {
  gCount = getValue('gCount', true);
  gBoxWidth = width / gCount;
  gCountY = floor(height / gBoxWidth);
  gHoverRadius = 0.8 * gBoxWidth;

  gDamping = getValue('gDamping');

  gPalette = gPalettes[gPaletteIndex % gPalettes.length];
  gPaletteIndex++;
  gCircles = [];
  let offsetY = (height - gBoxWidth * gCountY) / 2;
  //let offsetX = (width - gBoxWidth * gCount) / 2;
  for (let i = 1; i < gCountY - 1; i++) {
    let y = (0.5 + i) * gBoxWidth + offsetY;
    for (let i = 1; i < gCount - 1; i++) {
      let nI = new Circle((0.5 + i) * gBoxWidth, y);
      gCircles.push(nI);
    }
  }
}

function playSound() {
  if (!gReallySound.isPlaying() && (random() < gReallyOdds || gNopeCount > 100)) {
    gReallySound.play();
    gNopeCount = 0;
  } else {
    gSounds[int(random(gSounds.length))].play();
    gNopeCount++;
  }
}

function hoverCheck() {
  for (let c of gCircles) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < gBoxWidth) {
      c.trigger();
    }
  }
}

function mouseClicked() {
  createNewArt();
}

class Circle {
  constructor(x, y) {
    this.angle = 0;
    this.x = x;
    this.y = y;
    this.angleSpeed = getValue('gAngleSpeed');

    let r = random(gBoxWidth, gBoxWidth) * getValue('gRadius');
    let a = getValue('gAmplitude');
    let cIndex0 = int(random(gPalette.length));
    let cIndex1 = (cIndex0 + int(random(1, gPalette.length - 1))) % gPalette.length;
    let s0 = this.createShape(r, a, gPalette[cIndex0], createVector(0, 0));
    let s1 = this.createShape(
      r * getValue('gRadiusScalar'),
      getValue('gAmpScalar') * a,
      gPalette[cIndex1],
      createVector(random(-0.1, 0.1), random(0, 0.1))
    );
    this.shapes = [s0, s1];

    this.isAnimating = false;
  }

  trigger() {
    if (this.isAnimating) return;
    playSound();
    this.isAnimating = true;
  }

  createShape(r, a, c, o = 0) {
    let points = [];
    let n = getValue('gShapeNum', true);
    let angle = TWO_PI / n;
    let offset = getValue('gPointOffset', false);
    for (let i = 0; i < n; i++) {
      let newX = (cos(angle * i) + random(-offset, offset)) * r;
      let newY = (sin(angle * i) + random(-offset, offset)) * r;
      points.push(createVector(newX, newY));
    }
    let shape = { pts: points, amp: a, initAmp: a, col: c, off: o.mult(gBoxWidth) };
    return shape;
  }

  draw() {
    for (let s of this.shapes) {
      let offsetX = this.isAnimating ? sin(this.angle) * s.amp : 0;
      let xp = this.x + offsetX;
      fill(s.col);

      beginShape();
      for (let p of s.pts) {
        curveVertex(xp + p.x + s.off.x, this.y + p.y + s.off.y);
      }
      endShape(CLOSE);
    }

    if (this.isAnimating) {
      this.angle += this.angleSpeed;
      let isDone = true;
      for (let s of this.shapes) {
        s.amp *= gDamping;
        if (s.amp > 1) {
          isDone = false;
        }
      }
      if (isDone) {
        for (let s of this.shapes) {
          s.amp = s.initAmp;
        }
        this.angle = 0;
        this.isAnimating = false;
      }
    }
  }
}
