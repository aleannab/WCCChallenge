// A Clowder of Voids by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Void
//
// SOUND ON!
//
// Hi all! It's been a minute.
// Black cats are affectionately called 'voids' by many cat lovers
// Also, while working on this sketch, I learned that a group of cats is called a 'clowder.'
//
// Reused a lot of my code from my Nope sketch: https://openprocessing.org/sketch/2192676
//
// Made in honor of Miles, my beloved black cat and favorite 'void,' who will always hold a special place in my heart
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gVoids = [];
let gColumnCount = 8; //{ min: 11, max: 15 };
let gCirclePrecision = 0.4;
let gCircleOffset = 0.2;
let gCirclePtCount = 10;
let gRadiusScale = 0.5;
let gBoxWidth;

let gMeows = [];

let gBgColor = '#ffffff';
let gPalette = ['#0A001A'];
let gEyeColor = '#ddd927';

function preload() {
  soundFormats('wav', 'ogg');
  let meows = ['meow00', 'meow01', 'meow02', 'meow03', 'meow04', 'meow05', 'meow06', 'meow07'];
  for (let m of meows) {
    let sound = loadSound(m);
    sound.setVolume(0.5);
    gMeows.push(sound);
  }
}

function setup() {
  const l = 0.95 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(l, l);

  angleMode(DEGREES);
  noStroke();

  init();
}

function draw() {
  background(gBgColor);

  hoverCheck();

  for (let c of gVoids) {
    c.draw();
  }
}

function init() {
  gBoxWidth = width / gColumnCount;
  const rowCount = floor(height / gBoxWidth);
  const radius = (gRadiusScale * gBoxWidth) / 2;

  gStrokeWeight = 0.015 * gBoxWidth;

  gVoids = [];

  for (let col = 1; col < gColumnCount - 1; col++) {
    const x = (0.5 + col) * gBoxWidth;
    for (let row = 1; row < rowCount - 1; row++) {
      const y = (0.5 + row) * gBoxWidth;
      let circ = new Cat({
        xp: x,
        yp: y,
        radius: radius,
        precision: gCirclePrecision,
        offset: gCircleOffset,
        color: random(gPalette),
        numPts: gCirclePtCount,
      });
      gVoids.push(circ);
    }
  }
}

function hoverCheck() {
  for (let cat of gVoids) {
    let d = dist(mouseX, mouseY, cat.position.x, cat.position.y);
    cat.trigger(d < 0.5 * gBoxWidth);
  }
}

class Cat {
  constructor(data) {
    this.position = createVector(data.xp, data.yp);
    this.body = new ImperfectCircle(data);
    this.bodyScale = createVector(random(1, 1.5), random(1, 1.5));
    this.headData = {
      position: createVector(0.4 * data.radius, -1 * data.radius),
      rotation: random(360), //-80, 80),
      radius: 0.6 * data.radius,
      precision: 2 * gCirclePrecision,
      offset: 0.5 * gCircleOffset,
      color: 0,
      numPts: gCirclePtCount,
    };
    this.head = new CatHead(this.headData);
    this.isAnimating = false;
    this.isOpen = false;

    this.meow = random(gMeows);
    this.animVal = 0.0;
  }

  trigger(isOpen) {
    // Play sound only if the state changes
    if (isOpen && this.isOpen !== isOpen && !this.isAnimating) {
      this.meow.play();
    }
    this.isAnimating = true;
    this.isOpen = isOpen;
  }

  update() {
    const inc = this.isOpen ? 0.1 : -0.1;
    this.animVal = constrain(this.animVal + inc, 0, 1.0);

    if (this.animVal == 0 || this.animVal == 1) {
      this.isAnimating = false;
    }
  }

  draw() {
    if (this.isAnimating) this.update();
    push();
    translate(this.position.x, this.position.y);

    push();
    scale(this.bodyScale.x, this.bodyScale.y);
    this.body.draw();
    pop();
    push();
    rotate(this.headData.rotation);

    translate(this.animVal * this.headData.position.x, this.animVal * this.headData.position.y);
    this.head.draw(this.animVal);
    pop();
    pop();
  }
}

class CatHead {
  constructor(data) {
    this.head = new ImperfectCircle(data);

    this.earPts = [
      createVector(-0.4 * data.radius, 0), // base0
      createVector(0.4 * data.radius, 0), // base1
      createVector(0, -1.2 * data.radius), // tip
    ];
    const earOffset = createVector(-0.5 * data.radius, -0.3 * data.radius);
    const earRotation = 20;
    this.earPositions = [
      { offset: earOffset, rotation: -earRotation }, // Left ear
      { offset: createVector(-earOffset.x, earOffset.y), rotation: earRotation }, // Right ear
    ];

    const eyeOffset = createVector(-0.3 * data.radius, -0.2 * data.radius);
    this.eyePositions = [eyeOffset, createVector(-eyeOffset.x, eyeOffset.y)];
    this.eyeSize = 0.45 * data.radius;
  }

  draw(val) {
    this.head.draw();

    for (let ear of this.earPositions) {
      push();
      translate(ear.offset.x, ear.offset.y);
      rotate(ear.rotation);
      this.drawEar();
      pop();
    }

    stroke(gEyeColor);
    strokeWeight(val * gStrokeWeight);
    for (let eyePosition of this.eyePositions) {
      push();
      translate(eyePosition);
      ellipse(0, 0, this.eyeSize, this.eyeSize * val);
      pop();
    }
    noStroke();
  }

  // Function to draw an ear (a triangle)
  drawEar() {
    triangle(this.earPts[0].x, this.earPts[0].y, this.earPts[1].x, this.earPts[1].y, this.earPts[2].x, this.earPts[2].y); // Base and tip of the triangle
  }
}

class ImperfectCircle {
  constructor(data) {
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
    noStroke();
    fill(this.color);

    beginShape();
    for (let p of this.circlePts) {
      curveVertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}
