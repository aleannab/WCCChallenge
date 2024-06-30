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

let gBarCount = 100;
let gBars = [];
let gBarWidth;

const gHoldTime = 5000;
const gDropTime = 1000;
let gStartNextTime;

let gHueInc = 60;

let gVaryOdds = 0.75;

let gMaskLayer;

const gFlagPalettes = [
  ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'], // rainbow
  ['#5BCEFA', '#F7A8B8', '#FFFFFF'], // transgender
];
const gBgColor = '#ffffff';

let gFlagColorIndex = -1;
let gIsTransition = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 1, 1);

  noStroke();
  createBars();

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.noStroke();
  createPrideMask();

  gStartNextTime = millis();
}

function draw() {
  background(gBgColor);

  const now = millis();

  let shouldTrigger = now > gStartNextTime;

  if (shouldTrigger) {
    gStartNextTime += gIsTransition ? 3 * gDropTime : gHoldTime;
    if (gIsTransition) {
      gFlagColorIndex = (gFlagColorIndex + 1) % gFlagPalettes.length;
    }
    gIsTransition = !gIsTransition;
  }

  gBars.forEach((bar) => {
    if (shouldTrigger) bar.toggleTransition();
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
  gMaskLayer.textSize(500);
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
    bar.triggerDrop(millis());
  });
}

class Bar {
  constructor(xp) {
    this.pos = createVector(xp, 0);
    this.startTime = -1;
    this.isDropping = false;
    this.droppingStarted = false;

    this.activePalette = gFlagPalettes[0];
    this.col0 = gBgColor;
    this.col1 = gBgColor;

    //this.updateColor();

    this.dropTime = gDropTime;
    this.delay = 0;

    this.easeType = 0;
    this.inTransition = false;
  }

  toggleTransition() {
    this.inTransition = !this.inTransition;
  }

  triggerDrop(now) {
    this.startTime = now + this.delay;
    this.waitingToDrop = true;
  }

  drop(now) {
    this.col1 = this.col0;

    if (this.inTransition) {
      this.col0 = gBgColor;
    } else {
      // this.inTransition = false;
      this.updateColor();
      if (random() < gVaryOdds) {
        this.addVariance();
      }
    }

    this.isDropping = true;
    this.waitingToDrop = false;
  }

  updateColor() {
    this.activePalette = gFlagPalettes[gFlagColorIndex];
    let colIndex = floor(map(this.pos.x, 0, width, 0, this.activePalette.length)) % this.activePalette.length;
    this.col0 = this.activePalette[colIndex];
  }

  addVariance() {
    let variantType = int(random(4));
    let h = hue(this.col0);
    let s = saturation(this.col0);
    let b = brightness(this.col0);
    switch (variantType) {
      case 0:
        h += random(0.4, 0.5) * gHueInc;
        h = constrain(h, 0, 360);
        break;
      case 1:
        s += random(-0.1, 0.1);
        s = constrain(s, 0, 1);
        break;
      case 2:
        b += random(-0.1, 0.1);
        b = constrain(b, 0, 1);
        break;
      case 3:
        this.easeType = (this.easeType + 1) % 4;
    }
    this.col0 = color(h, s, b);
  }

  update(now) {
    if (this.waitingToDrop && now > this.startTime) {
      this.drop(now);
    }

    if (this.isDropping) {
      let elapsed = now - this.startTime;
      let progress = constrain(elapsed / this.dropTime, 0, 1);
      let easeValue = this.ease(progress);
      this.pos.y = lerp(0, height, easeValue);
      if (progress >= 1) {
        this.isDropping = false;
        this.triggerDrop(now);
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
