// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gCircles = [];
let gRowCount = 10;
let gColCount = 10;
let gBoxWidth, gBoxHeight;

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
  gBoxWidth = width / gColCount;
  gBoxHeight = height / gRowCount;

  createNewArt();
}

function draw() {
  background(gBgColor);
  triggerHoveredCircle();
  for (let c of gCircles) {
    c.draw();
  }
}

function createNewArt() {
  for (let i = 1; i < gRowCount - 1; i++) {
    let y = (0.5 + i) * gBoxHeight;
    for (let i = 1; i < gColCount - 1; i++) {
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

function triggerHoveredCircle() {
  for (let c of gCircles) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < 25) {
      c.trigger();
    }
  }
}

class Circle {
  constructor(x, y) {
    this.angle = 0; // Initial angle for sine function
    this.initAmplitude = random(5, 10);
    this.amplitude = this.initAmplitude; // Initial amplitude of shaking
    this.x = x; // Horizontal position of the circle
    this.y = y; // Vertical position of the circle
    this.angleSpeed = random(0.2, 0.4);
    this.r = 0.4 * random(gBoxHeight, gBoxWidth);
    this.vertices = this.createPointsInCircle(this.r, 10);
    this.smCircle = this.createPointsInCircle(0.5 * this.r, 10);
    this.c = random(gPalette);
    this.c2 = random(gPalette);

    this.isAnimating = false;
  }

  trigger() {
    if (this.isAnimating) return;
    playSound();
    this.isAnimating = true;
  }

  createPointsInCircle(r, n) {
    let points = [];
    let angle = TWO_PI / n;
    for (let i = 0; i < n; i++) {
      let newX = (cos(angle * i) + random(-0.1, 0.1)) * r;
      let newY = (sin(angle * i) + random(-0.1, 0.1)) * r;
      points.push(createVector(newX, newY));
    }
    return points;
  }

  draw() {
    // Calculate horizontal position using sine function
    let offsetX = this.isAnimating ? sin(this.angle) * this.amplitude : 0;
    let xp = this.x + offsetX;
    fill(this.c);

    // Draw the circle
    beginShape();
    for (let v of this.vertices) {
      curveVertex(xp + v.x, this.y + v.y);
    }
    endShape(CLOSE);

    fill(this.c2);
    beginShape();
    for (let v of this.smCircle) {
      curveVertex(xp + v.x, this.y + v.y);
    }
    endShape(CLOSE);
    // ellipse(xp, this.y, this.r, this.r);

    if (this.isAnimating) {
      // Update angle for next frame
      this.angle += this.angleSpeed; // Adjust speed of shaking

      // Gradually decrease the amplitude
      this.amplitude *= 0.99; // Adjust damping factor
    }

    // Reset parameters if amplitude becomes very small
    if (this.amplitude < 1) {
      this.amplitude = this.initAmplitude; // Reset amplitude
      this.angle = 0; // Reset angle
      this.isAnimating = false;
    }
  }
}
