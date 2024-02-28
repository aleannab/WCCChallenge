// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gCircles = [];
let gCount = 10;
let gBoxWidth;
let gHoverRadius;
let gDamping;

let gSounds = [];
let gReallySound;

let gReallyOdds;

let gBgColor = '#f4f1ea';
let gPalette = ['#3567af', '#c04e82', '#538e47', '#e88740', '#016d6f', '#e25c43'];

function preload() {
  soundFormats('mp3', 'ogg');
  gSounds.push(loadSound('nope00'));
  gSounds.push(loadSound('nope01'));
  gSounds.push(loadSound('nope02'));
  gSounds.push(loadSound('nope03'));
  gReallySound = loadSound('really');
}

function setup() {
  let l = windowWidth < windowHeight ? windowWidth : windowHeight;
  createCanvas(l, l);
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
  gHoverRadius = 0.8 * gBoxWidth;
  gReallyOdds = getValue('gReallyOdds');

  gDamping = getValue('gDamping');

  gCircles = [];
  for (let i = 1; i < gCount - 1; i++) {
    let y = (0.5 + i) * gBoxWidth;
    for (let i = 1; i < gCount - 1; i++) {
      let nI = new Circle((0.5 + i) * gBoxWidth, y);
      gCircles.push(nI);
    }
  }
}

function playSound() {
  if (!gReallySound.isPlaying() && random() < gReallyOdds) {
    gReallySound.play();
  } else {
    gSounds[int(random(gSounds.length))].play();
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
    let s0 = this.createShape(r, a);
    let s1 = this.createShape(r * getValue('gRadiusScalar'), getValue('gAmpScalar') * a);
    this.shapes = [s0, s1];

    this.isAnimating = false;
  }

  trigger() {
    if (this.isAnimating) return;
    playSound();
    this.isAnimating = true;
  }

  createShape(r, a) {
    let points = [];
    let n = getValue('gShapeNum', true);
    let angle = TWO_PI / n;
    let offset = getValue('gPointOffset', false);
    for (let i = 0; i < n; i++) {
      let newX = (cos(angle * i) + random(-offset, offset)) * r;
      let newY = (sin(angle * i) + random(-offset, offset)) * r;
      points.push(createVector(newX, newY));
    }
    let shape = { pts: points, amp: a, initAmp: a, col: random(gPalette) };
    return shape;
  }

  draw() {
    for (let s of this.shapes) {
      let offsetX = this.isAnimating ? sin(this.angle) * s.amp : 0;
      let xp = this.x + offsetX;
      fill(s.col);

      beginShape();
      for (let p of s.pts) {
        curveVertex(xp + p.x, this.y + p.y);
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
