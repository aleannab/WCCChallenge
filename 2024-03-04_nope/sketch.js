// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gCircles = [];
let gCount = 10;
let gBoxWidth;
let gHoverRadius;

let gSounds = [];
let gReallySound;

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
  gBoxWidth = width / gCount;
  gHoverRadius = 0.8 * gBoxWidth;

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
  for (let i = 1; i < gCount - 1; i++) {
    let y = (0.5 + i) * gBoxWidth;
    for (let i = 1; i < gCount - 1; i++) {
      let nI = new Circle((0.5 + i) * gBoxWidth, y);
      gCircles.push(nI);
    }
  }
}

function playSound() {
  if (random() < 0.05) {
    gReallySound.play();
  } else {
    gSounds[int(random(gSounds.length))].play();
  }
}

function hoverCheck() {
  for (let c of gCircles) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < gHoverRadius) {
      c.trigger();
    }
  }
}

class Circle {
  constructor(x, y) {
    this.angle = 0;
    this.x = x;
    this.y = y;
    this.angleSpeed = random(0.2, 0.4);

    let r = 0.4 * random(gBoxWidth, gBoxWidth);
    let a = random(5, 10);
    let s0 = this.createShape(r, a);
    let s1 = this.createShape(r * 0.5, 2 * a);
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
    let n = random(8, 10);
    let angle = TWO_PI / n;
    for (let i = 0; i < n; i++) {
      let newX = (cos(angle * i) + random(-0.1, 0.1)) * r;
      let newY = (sin(angle * i) + random(-0.1, 0.1)) * r;
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
      let isDone = false;
      for (let s of this.shapes) {
        s.amp *= 0.99;
        if (s.amp < 1) {
          isDone = true;
          s.amp = s.initAmp;
        }
      }
      if (isDone) {
        this.angle = 0;
        this.isAnimating = false;
      }
    }
  }
}
