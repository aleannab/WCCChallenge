// Rights for All, Love for All by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Pride Flags
//
// Repurposed my (failed 😝) unsatisfying submission for the word/color transitions.
//
// Thank you jordanne for your pride flag color palettes 🌈
// https://openprocessing.org/sketch/1985103
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gBarCount = 100;
let gBars = [];
let gBarWidth;

const gHoldTime = 10000;
const gDropTime = 800;
let gStartNextTime;

let gHueInc = 20;

let gVaryOdds = 0.9;

let gMaskLayer;

const gFlagDetails = [
  { palette: ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'], name: 'PRIDE', phrase: 'Love is love.' },
  { palette: ['#D60270', '#9B4F96', '#0033A0'], name: 'BISEXUAL', phrase: 'Visibility matters.' },
  { palette: ['#5BCEFA', '#F7A8B8', '#FFFFFF'], name: 'TRANS', phrase: 'Trans rights are human rights.' },
  { palette: ['#D62900', '#FF9B55', '#FFD780', '#FFFFFF', '#D461A6', '#BC3784', '#A60061'], name: 'LESBIAN', phrase: 'Love and solidarity.' },
  { palette: ['#FF1B8D', '#FFDA00', '#1BB3FF'], name: 'PANSEXUAL', phrase: 'Love beyond gender.' },
  { palette: ['#000000', '#A3A3A3', '#FFFFFF', '#810082'], name: 'ASEXUAL', phrase: 'Valid in every way.' },
  { palette: ['#B57EDC', '#FFFFFF', '#4A8123'], name: 'GENDERQUEER', phrase: 'Embrace your identity.' },
  { palette: ['#FFF433', '#FFFFFF', '#9B59D0', '#000000'], name: 'NONBINARY', phrase: 'Exist beyond the binary.' },
  { palette: ['#FFDA00', '#7900CD'], name: 'INTERSEX', phrase: 'Recognize our existence.' },
  { palette: ['#078D70', '#26CEAA', '#99E8C2', '#FFFFFF', '#7BADE3', '#5049CB', '#3E1A78'], name: 'GAY MEN', phrase: 'Proud to love.' },
  { palette: ['#3DA542', '#A7D379', '#FFFFFF', '#A9A9A9', '#000000'], name: 'AROMANTIC', phrase: 'Love takes many forms.' },
  { palette: ['#FF75A2', '#F5F5F5', '#BE18D6', '#2C2C2C', '#333EBD'], name: 'GENDERFLUID', phrase: 'Fluidity is beautiful.' },
  { palette: ['#000000', '#B9B9B9', '#FFFFFF', '#B8F483'], name: 'AGENDER', phrase: 'Identity beyond gender.' },
  { palette: ['#203856', '#62AEDC', '#FFFFFF', '#ECCD00', '#E28C00'], name: 'ARO & ACE', phrase: 'Our spectrum, our strength.' },
];
const gBgColor = '#EAE5F5';

let gFlagColorIndex = 0;
let gIsTransition = true;

let gFont;

function preload() {
  gFont = loadFont('Roboto-Black.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 1, 1);

  noStroke();
  createBars();

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.noStroke();
  gMaskLayer.textFont(gFont);
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
      gFlagColorIndex = (gFlagColorIndex + 1) % gFlagDetails.length;
    } else {
      createPrideMask();
    }
    gIsTransition = !gIsTransition;
  }

  gBars.forEach((bar) => {
    if (shouldTrigger) bar.toggleTransition();
    bar.update(now);
    bar.draw();
  });
  image(gMaskLayer, 0, 0);
}

function createPrideMask() {
  gMaskLayer.background(gBgColor);
  gMaskLayer.blendMode(BLEND);
  gMaskLayer.erase();
  gMaskLayer.textAlign(CENTER, CENTER);
  let flag = gFlagDetails[gFlagColorIndex];
  let count = floor(random(3)) + 1;
  let phrase = flag.phrase;
  for (let i = 0; i < count; i++) {
    phrase += ' ' + flag.phrase;
  }
  let size = findTextSize(phrase, width);
  gMaskLayer.textSize(size);
  count = ceil(height / size) + 1;
  let combined = phrase + ' ' + phrase + ' ' + phrase;
  let xInc = width / count;
  for (let i = 0; i < count; i++) {
    gMaskLayer.text(combined, xInc * i, size * i);
  }
  gMaskLayer.noErase();
}

function findTextSize(word, targetWidth) {
  let size = 1;
  textSize(size);

  while (textWidth(word) < targetWidth) {
    size += 1;
    textSize(size);
  }

  return size * 0.8;
}

function createBars() {
  gVaryOdds = 10 / gBarCount;
  let spacing = ceil(width / gBarCount);
  gBarCount = ceil(width / spacing);
  gBarWidth = spacing + 1;

  for (let i = 0; i < gBarCount; i++) {
    gBars.push(new Bar(spacing * i));
  }

  gBars.forEach((bar) => {
    bar.delay = random(gDropTime);
    bar.triggerDrop(millis());
  });
}

class Bar {
  constructor(xp) {
    this.pos = createVector(xp, 0);
    this.startTime = -1;
    this.isDropping = false;
    this.droppingStarted = false;

    this.activePalette = gFlagDetails[0].palette;
    this.col0 = gBgColor;
    this.col1 = gBgColor;

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
      // if (random() < gVaryOdds) {
      this.addVariance();
      // }
    }

    this.isDropping = true;
    this.waitingToDrop = false;
  }

  updateColor() {
    this.activePalette = gFlagDetails[gFlagColorIndex].palette;
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
        h += random(0.3, 0.4) * gHueInc;
        h = constrain(h, 0, 360);
        break;
      case 1:
        s += random(-0.1, 0.1);
        s = constrain(s, 0, 1);
        break;
      case 2:
        b += random(-0.05, 0.05);
        b = constrain(b, 0, 1);
        break;
      case 3:
        this.easeType = (this.easeType + 1) % 4;
        break;
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
