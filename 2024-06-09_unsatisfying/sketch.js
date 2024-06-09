// Created for the #WCCChallenge - Topic: Unsatisfying
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;

let gBarCount = 50;

let gBars = [];

let gNextDropInterval = 3000;
let gDropTime = 2000;
let gHue = 0;
let gSaturation = 0.5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 1, 1);

  noStroke();

  createBars();

  let dropTime = millis() + 3000;
  let dropInc = dropTime / gBarCount;

  gBars.forEach((bar) => {
    bar.initStart(dropTime);
    dropTime += dropInc;
  });
}

function draw() {
  background(255);
  let currentTime = millis();

  gBars.forEach((bar) => {
    bar.update(currentTime);
    bar.draw();
  });
}

function createBars() {
  let barWidth = width / gBarCount;

  for (let i = 0; i < gBarCount; i++) {
    gBars.push(new Bar(barWidth * i, barWidth));
  }

  gBars[int(random(gBars.length))].off = 2;
}

function easeInQuart(t) {
  return t * t * t * t;
}

class Bar {
  constructor(xp, w, off = 1) {
    this.width = w;
    this.col0 = color(gHue, gSaturation, map(xp, 0, width, 1, 0.5));
    this.col1 = color(map(xp, 0, width, 1, 0.5));
    this.pos = createVector(xp, 0);
    this.off = off;
    this.startTime = -1;
    this.isDropping = false;
    this.isFirstDrop = true;
    this.hue = gHue;
    this.hueInc = 50;
    this.sat = gSaturation;
  }

  initStart(t) {
    this.startTime = t;
  }

  drop() {
    if (!this.isFirstDrop) {
      this.col1 = this.col0;
      if (random() < 1 / gBarCount) {
        this.addVariance();
      } else {
        this.hue = (this.hue + this.hueInc) % 360;
      }
      this.col0 = color(this.hue, this.sat, map(this.pos.x, 0, width, 1, 0.5));
    }

    this.isDropping = true;
    this.isFirstDrop = false;
  }

  addVariance() {
    let variantType = int(random(2));
    switch (variantType) {
      case 0:
        this.hue = (this.hue + int(random(0.5 * this.hueInc))) % 360;
        break;
      case 1:
        this.sat += random(-0.1, 0.1);
        this.sat = constrain(this.sat, 0, 1);
        this.hue = (this.hue + this.hueInc) % 360;
        break;
    }
  }

  update(now) {
    if (!this.isDropping && now >= this.startTime) {
      this.drop();
    }

    if (this.isDropping) {
      let elapsed = now - this.startTime;
      let t = constrain(elapsed / gDropTime, 0, 1);
      let easeValue = easeInQuart(t);

      this.pos.y = lerp(0, height, easeValue);

      if (t >= 1) {
        this.startTime = now + gNextDropInterval;
        this.isDropping = false;
      }
    }
  }

  draw() {
    fill(this.col0);
    rect(this.pos.x, 0, this.width, height);
    fill(this.col1);
    rect(this.pos.x, this.pos.y, this.width, height);
  }
}
