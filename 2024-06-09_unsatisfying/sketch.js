// Creeping Deviations by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Unsatisfying
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gBarCount = 100;
let gBars = [];
let gBarWidth;

let gNextDropInterval = 3000;
let gDropTime = 2000;
let gHue = 0;
let gHueInc = 50;
let gSaturation = 0.5;

let gVaryOdds = 0.1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 1, 1);

  noStroke();

  createBars();
}

function draw() {
  background(255);
  let t = millis();

  gBars.forEach((bar) => {
    bar.update(t);
    bar.draw();
  });
}

function createBars() {
  gVaryOdds = 1 / gBarCount;
  let spacing = ceil(width / gBarCount);
  gBarWidth = spacing - 1;

  for (let i = 0; i < gBarCount; i++) {
    gBars.push(new Bar(spacing * i));
  }

  let dropTime = millis() + 1000;
  let dropInc = dropTime / gBarCount;

  gBars.forEach((bar) => {
    bar.startTime = dropTime;
    dropTime += dropInc;
  });
}

class Bar {
  constructor(xp) {
    this.pos = createVector(xp, 0);
    this.startTime = -1;
    this.isDropping = false;
    this.isFirstDrop = true;

    this.hue = gHue;
    this.sat = gSaturation;
    this.bright = map(xp, 0, width, 1, 0.5);

    this.col0 = color(this.hue, this.sat, this.bright);
    this.col1 = color(map(xp, 0, width, 1, 0.5));

    this.odds = gVaryOdds;
    this.dropTime = gDropTime;
  }

  drop() {
    if (!this.isFirstDrop) {
      this.col1 = this.col0;
      if (random() < this.odds) {
        this.addVariance();
        this.odds *= 2;
        console.log(this.odds);
      }

      this.hue = (this.hue + gHueInc) % 360;
      this.col0 = color(this.hue, this.sat, this.bright);
    }

    this.isDropping = true;
    this.isFirstDrop = false;
  }

  addVariance() {
    let variantType = int(random(4));
    switch (variantType) {
      case 0:
        this.hue += random(0.25, 0.5) * gHueInc;
        this.hue = constrain(this.hue, 0, 360);
        break;
      case 1:
        this.sat += random(-0.1, 0.1);
        this.sat = constrain(this.sat, 0, 1);
        break;
      case 2:
        this.dropTime *= random(0.9, 1.1);
        break;
      case 3:
        this.bright += random(-0.1, 0.1);
        this.bright = constrain(this.bright, 0, 1);
        break;
    }
  }

  update(now) {
    if (!this.isDropping && now >= this.startTime) {
      this.drop();
    }

    if (this.isDropping) {
      let elapsed = now - this.startTime;
      let t = constrain(elapsed / this.dropTime, 0, 1);
      let easeValue = this.easeInQuad(t);

      this.pos.y = lerp(0, height, easeValue);

      if (t >= 1) {
        this.startTime = now + gNextDropInterval;
        this.isDropping = false;
      }
    }
  }

  draw() {
    fill(this.col0);
    rect(this.pos.x, 0, gBarWidth, height);
    fill(this.col1);
    rect(this.pos.x, this.pos.y, gBarWidth, height);
  }

  easeInQuad(t) {
    return t * t * t * t;
  }
}
