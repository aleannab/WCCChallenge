// Created for the #WCCChallenge - Swiss Design
//
// Gah this code is a mess lol. 🫣
// Uses the PoetryDB API: https://poetrydb.org/index.html
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gMaskLayer;

// array of poets necessary, or else making a random call is dominated by a few poets with significantly more poems in their repetoire. This array is not all inclusive.
let gPoets = [
  'whittier',
  'watts',
  'wilmot',
  'henley',
  'clare',
  'browning',
  'milton',
  'herrick',
  'raleigh',
  'pope',
  'dunbar',
  'dryden',
  'shakespeare',
  'seeger',
  'drayton',
  'byron',
  'blake',
  'shelley',
  'wordsworth',
  'poe',
  'keats',
  'chaucer',
  'whitman',
];

let gPoemData = [];
let gFirstName;
let gLastName;
let gTitle;
let gFontBlock;
let gFontReg;
let gFontThin;
let gPalette = ['#00b8b8', '#e4bd0b', '#de3d83'];
// let gSecondaryPalette = ['#ae2905', '#002852', '#007a07'];
let gColIndexStart;
let gAngleOffset;

let gRandomSeed = 0;
let gPoetIndex = 0;

function preload() {
  gFontBlock = loadFont('Roboto-Black.ttf');
  gFontReg = loadFont('Roboto-Regular.ttf');
  gFontThin = loadFont('Roboto-Light.ttf');
}

function setup() {
  let h = windowHeight < windowWidth ? windowHeight : 0.707 * windowWidth;
  let w = windowHeight < windowWidth ? 1.414 * windowHeight : windowWidth;
  createCanvas(0.95 * w, 0.95 * h);
  gAngleOffset = atan(height / width);

  textAlign(LEFT, CENTER);
  noStroke();

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.noStroke();
  gMaskLayer.textAlign(CENTER, CENTER);
  // gMaskLayer.rectMode(CENTER);

  gPoetIndex = floor(random(gPoets.length));
  createNewArt();
}

function drawPoster() {
  background(0);

  createPoemLines();

  createNameMask();

  createTitle();
}

function createNameMask() {
  gMaskLayer.background('#e0e5db');

  push();
  setLayerProps(gMaskLayer, MULTIPLY, false);
  drawRects();

  pop();
  setLayerProps(gMaskLayer, BLEND, true);

  setTextProps(gMaskLayer, gFontBlock, gFirstName.tsize, 0.7);
  addText(gMaskLayer, gFirstName.tstring, width / 2, height / 2, gAngleOffset);
  image(gMaskLayer, 0, 0);
}

function createPoemLines() {
  setTextProps(this, gFontReg);
  textFont(gFontReg);

  let wrapLength = 0.1 * width;
  let spacing = width / gPoemData.length;
  xp = 0;
  for (let line of gPoemData) {
    if (random() > 0.8) line = addLineBreaks(line);
    let tsize = random(0.01, 0.02) * width;
    setTextSizeProps(this, tsize, 0.8);
    addText(this, line, xp, xp + random(-0.2, 0.2) * height, (floor(random(4)) * PI) / 2 + PI / 2 + gAngleOffset, random(1, 2) * wrapLength);
    xp += spacing;
  }
}

function setLayerProps(layer, blendMode, isErase) {
  layer.blendMode(blendMode);
  if (isErase) layer.erase();
  else layer.noErase();
}

function setTextProps(layer, font, size, leading) {
  layer.textFont(font);
  setTextSizeProps(layer, size, leading);
}

function setTextSizeProps(layer, size = -1, leading = -1) {
  if (size > 0 && leading > 0) {
    layer.textSize(size);
    layer.textLeading(leading * size);
  }
}

function addText(layer, str, translateX, translateY, angle, wrapLength = -1, col = -1, isPushPop = true, xp = 0, yp = 0) {
  layer.fill(col < 0 ? random(gPalette) : col);
  if (isPushPop) layer.push();
  layer.translate(translateX, translateY);
  layer.rotate(angle);
  if (wrapLength < 0) layer.text(str, xp, yp);
  else layer.text(str, xp, yp, wrapLength);
  if (isPushPop) layer.pop();
}

function createTitle() {
  let colIndex = gColIndexStart;
  setTextProps(this, gFontBlock, gLastName.tsize, 0.8);
  push();
  addText(this, gLastName.tstring, 0.7 * width, 0.55 * height, gAngleOffset - PI / 2, -1, gPalette[colIndex], false);

  textAlign(RIGHT, TOP);
  setTextProps(this, gFontThin, gTitle.tsize, 0.8);
  addText(this, gTitle.tstring, 0, 0, PI, 0.3 * width, gPalette[(colIndex + 1) % gPalette.length], false, -0.3 * width, gTitle.tsize);

  pop();
}

function drawRects() {
  let spacing = width / 4;
  let isExtraRotated = false;
  let colIndex = gColIndexStart; //floor(random(gPalette.length));
  for (let i = 0; i < 3; i++) {
    gMaskLayer.push();
    gMaskLayer.translate(spacing * (i + 1), i < 2 ? random(height) : random(height / 3, height / 2));
    gMaskLayer.rotate(gAngleOffset - (isExtraRotated ? -PI / 2 : 0));
    gMaskLayer.fill(gPalette[colIndex]);
    gMaskLayer.rect(0, 0, (floor(random(4)) + 1) * width * 0.15, width);
    gMaskLayer.pop();
    isExtraRotated = !isExtraRotated;
    colIndex = (colIndex + 1) % gPalette.length;
  }
}

function addLineBreaks(inputString) {
  let words = inputString.split(' ');

  return words.join('\n');
}

function getFontSize(textString, length) {
  fontSize = 100;
  textSize(fontSize);
  let tw = textWidth(textString);
  if (tw === 0) return 0;

  if (tw > length) {
    while (tw > length) {
      fontSize--;
      textSize(fontSize);
      tw = textWidth(textString);
    }
  } else {
    while (tw < length) {
      fontSize++;
      textSize(fontSize);
      tw = textWidth(textString);
    }
    fontSize--;
  }
  return fontSize;
}

function createNewArt() {
  getPoem();
  gPoetIndex = (gPoetIndex + 1) % gPoets.length;
  gColIndexStart = floor(random(gPalette.length));
}

function getPoem() {
  let url = 'https://poetrydb.org/random,author/2;' + gPoets[gPoetIndex];
  loadJSON(url, recievedPoem);
}

function recievedPoem(data) {
  if (data && data.length > 0) {
    gPoemData = data[0].lines.slice(0, 50);

    let fullName = data[0].author;
    let first = fullName.split(' ')[0];
    let title = data[0].title;

    let last = addLineBreaks(fullName.split(' ').slice(1).join(' '));
    let lSize = 1.1 * getFontSize(first, width);
    let rSize = 1.75 * getFontSize(last.split('\n')[0], height / 3);
    let tSize = max(rSize / 3, getFontSize(title, height / 3));

    gFirstName = { tstring: first, tsize: lSize };
    gLastName = { tstring: last, tsize: rSize };
    gTitle = { tstring: title, tsize: tSize };
    drawPoster();
  } else {
    console.log('No poems found');
  }
}

function mouseClicked() {
  createNewArt();
}
