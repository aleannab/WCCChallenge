// Creeping Deviations by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Unsatisfying
//
// I had a hard time with this challenge. I toyed around with a few concepts,
// but never felt truly satisfied that it was unsatisfying enough.
// ...so I guess that is on theme afterall? Haha.
//
// Here's where I landed. It's pretty straight forward.
// Bars are falling downwards.
// There is a small chance a slight variation will be added to an individual bar
// (hue, saturation, brightness, time of drop, easing type).
// Once a bar has deviated, the chances of it deviating again doubles.
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gBarCount = 50;
let gBars = [];
let gBarWidth;

let gNextDropInterval = 3000;
let gDropTime = 2000;
let gHue = 0;
let gHueInc = 60;
let gSaturation = 0.5;

let gVaryOdds;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 1, 1);

  gHue = int(random(360));

  noStroke();

  noLoop();
}
function mouseClicked() {
  createBars();
  loop();
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
  gVaryOdds = 10 / gBarCount;
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

    this.easeType = 0;
  }

  drop() {
    if (!this.isFirstDrop) {
      this.col1 = this.col0;
      if (random() < this.odds) {
        this.addVariance();
        this.odds *= 2;
      }

      this.hue = (this.hue + gHueInc) % 360;
      this.col0 = color(this.hue, this.sat, this.bright);
    }

    this.isDropping = true;
    this.isFirstDrop = false;
  }

  addVariance() {
    let variantType = int(random(5));
    switch (variantType) {
      case 0:
        this.hue += random(0.4, 0.5) * gHueInc;
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
      case 4:
        this.easeType = (this.easeType + 1) % 4;
    }
  }

  update(now) {
    if (!this.isDropping && now >= this.startTime) {
      this.drop();
    }

    if (this.isDropping) {
      let elapsed = now - this.startTime;
      let t = constrain(elapsed / this.dropTime, 0, 1);
      let easeValue = this.ease(t);

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

  ease(t) {
    switch (this.easeType) {
      case 0:
        t = this.easeInQuart(t);
        break;
      case 1:
        t = this.easeInQuad(t);
        break;
      case 2:
        t = this.easeInSine(t);
        break;
      case 3:
        t = this.easeInQuint(t);
    }
    return t;
  }

  easeInQuart(t) {
    return t * t * t * t;
  }

  easeInQuad(t) {
    return t * t;
  }

  easeInSine(t) {
    return 1 - cos((t * PI) / 2);
  }

  easeInQuint(t) {
    return t * t * t * t * t;
  }
}
