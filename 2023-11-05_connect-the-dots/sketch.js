// Created for the #WCCChallenge - Connecting the Dots

let dots = [];
let numDots = 7;
let timeWarp = 0.0005;

// size variables
let sDotMin = 20;
let sDotMax = 60;
let sCircleMin = 150;
let sCircleMax = 400;
let sVarMin = 10;
let sVarMax = 50;

// motion variables
let ampMin = 0.3;
let ampMax = 0.5;

let pLength;
let hue;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  colorMode(HSB, 100);

  pLength = 0.3 * (width < height ? width : height);
  createDots();
}

function mouseClicked() {
  createDots();
}

function createDots() {
  randomSeed(random(0, 9999));
  hue = random(0, 100);
  // Distribute inital positions radially from screen mid point
  numDots = floor(random(5, 9));
  let inc = TWO_PI / numDots;
  let delta = 0.3 * inc;
  dots = [];

  for (let i = 0; i < numDots; i++) {
    let theta = i * inc + random(-delta, delta);
    let x = cos(theta) * pLength + 0.5 * width;
    let y = sin(theta) * pLength + 0.5 * height;
    let d = new Dottie(x, y);
    dots.push(d);
  }
}

function drawRing(a, b) {
  let centerX = (a.position.x + b.position.x) / 2;
  let centerY = (a.position.y + b.position.y) / 2;
  let diameter = dist(a.position.x, a.position.y, b.position.x, b.position.y);

  let c = color(hue, random(0, 100), random(20, 30), random(40, 70));
  stroke(c);
  strokeWeight(2);
  noFill();

  circle(centerX, centerY, diameter);
}

function draw() {
  background(220, 50);

  // Update positions/size
  dots.forEach((d) => {
    d.run(millis());
  });

  // Draw ring connections
  for (let i = 0; i < dots.length; i++) {
    let circle = dots[i];
    let next = dots[(i + 1) % dots.length];
    drawRing(circle, next);
  }

  // Draw dots
  noStroke();
  dots.forEach((d) => {
    fill(d.colorDot);
    circle(d.position.x, d.position.y, d.sizeCircle);

    fill(255);
    circle(d.position.x, d.position.y, d.sizeDot);
  });
}

class Dottie {
  constructor(x, y) {
    // init positions
    this.origin = createVector(x, y);
    this.position = createVector(x, y);

    // init sizes
    let s = floor(random(sCircleMin, sCircleMax));
    this.sizeCircle = s;
    this.sizeCircleOG = s;
    this.sizeVar = random(sVarMin, sVarMax);
    this.sizeDot = floor(random(sDotMin, sDotMax));

    // init color;
    this.colorDot = color((hue + random(-20, 20)) % 100, 100, 90, random(10, 30));

    // init motion vars
    let ampX = (random(0, 1) < 0.5 ? -1 : 1) * random(ampMin, ampMax) * pLength;
    let ampY = (random(0, 1) < 0.5 ? -1 : 1) * random(ampMin, ampMax) * pLength;
    this.amplitude = createVector(ampX, ampY);
    this.offset = createVector(random(0, TWO_PI), random(0, TWO_PI));
    this.frequency = random(0.5, 1.0) * timeWarp;
  }

  run(t) {
    this.position.x = this.origin.x + sin(t * this.frequency + this.offset.x) * this.amplitude.x;
    this.position.y = this.origin.y + cos(t * this.frequency + this.offset.y) * this.amplitude.y;
    this.sizeCircle = this.sizeCircleOG + (sin(t * 0.0003 + this.offset.x) + 1) * this.sizeVar;
  }
}
