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

const gHoldTime = 3000;
const gDropTime = 1000;
const gIntervalTime = gHoldTime + gDropTime;
let gStartNextTime;

let gVaryOdds;

let gMaskLayer;

const gFlagPalettes = [
  ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'], // rainbow
  ['#5BCEFA', '#F7A8B8', '#FFFFFF'], // transgender
];
const gBgColor = '#ffffff';

let gFlagColorIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 1, 1);

  noStroke();
  createBars();

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.noStroke();
  createPrideMask();

  gStartNextTime = millis(); // + gIntervalTime;
}

function draw() {
  background(gBgColor);

  const now = millis();

  let shouldTrigger = now > gStartNextTime;

  if (shouldTrigger) {
    gStartNextTime += gIntervalTime;
    gFlagColorIndex = (gFlagColorIndex + 1) % gFlagPalettes.length;
  }

  gBars.forEach((bar) => {
    if (shouldTrigger) bar.triggerDrop(now);
    bar.update(now);
    bar.draw();
  });
  // image(gMaskLayer, 0, 0);
}

function createPrideMask() {
  gMaskLayer.background('#ffffff');

  gMaskLayer.blendMode(BLEND);
  gMaskLayer.erase();
  gMaskLayer.textAlign(CENTER);
  gMaskLayer.textSize(400);
  gMaskLayer.text('pride', width / 2, height / 2);
}

function createBars() {
  gVaryOdds = 10 / gBarCount;
  let spacing = ceil(width / gBarCount);
  gBarCount = ceil(width / spacing);
  gBarWidth = spacing + 1;

  for (let i = 0; i < gBarCount; i++) {
    gBars.push(new Bar(spacing * i));
  }

  let dropInc = gDropTime / gBarCount;

  let delay = 0;

  gBars.forEach((bar) => {
    bar.delay = delay;
    delay += dropInc;
  });
}

class Bar {
  constructor(xp) {
    this.pos = createVector(xp, 0);
    this.startTime = -1;
    this.isDropping = false;

    this.activePalette = gFlagPalettes[gFlagColorIndex];
    this.col0 = gBgColor;
    this.col1 = gBgColor;

    this.updateColor();

    this.odds = gVaryOdds;
    this.dropTime = gDropTime;
    this.delay = 0;

    this.easeType = 0;
  }

  triggerDrop(now) {
    this.startTime = now + this.delay;
  }

  drop(now) {
    // + gIntervalTime;
    this.col1 = this.col0;
    // if (random() < this.odds) {
    //   this.addVariance();
    //   this.odds *= 2;
    // }

    // if (this.isWhite) {
    //   this.col0 = color('#ffffff');
    // } else {
    this.updateColor();
    // }
  }

  updateColor() {
    this.activePalette = gFlagPalettes[gFlagColorIndex];
    let colIndex = floor(map(this.pos.x, 0, width, 0, this.activePalette.length)) % this.activePalette.length;
    this.col0 = this.activePalette[colIndex];
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
        // this.dropTime *= random(0.9, 1.1);
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
    if (!this.isDropping && now > this.startTime) {
      this.isDropping = true;
      this.drop(now);
    }

    if (this.isDropping) {
      let elapsed = now - this.startTime;
      let progress = constrain(elapsed / this.dropTime, 0, 1);
      let easeValue = this.ease(progress);
      this.pos.y = lerp(0, height, easeValue);
      if (progress >= 1) {
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
