// Poster Poetry by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Swiss Design
//
// Honestly don't really remember if there was a singular piece for inspiration. 😅
// I basically searched on Google and Pinterest 'swiss design poster' and went from there.
//
// Uses the PoetryDB API: https://poetrydb.org/index.html
// Mask uses the poet's first name.
// Outside text is the poet's middle/last name and the title of the featured poem.
// Text inside the name are line snippets from said poem.
//
// I'd like to improve on this to have a nicer distribution of line snippets within the letters.
// Some of the poems are also very short. So maybe having it repeat lines if so.
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
let gFirstName, gLastName, gTitle;
let gFontBlock, gFontReg, gFontThin;
let gPalette = ['#00b8b8', '#e4bd0b', '#de3d83'];
let gSecondaryPalette = ['#007a07', '#ae2905', '#002852'];

let gColIndexStart;
let gAngleOffset;
let gSlope;

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
  gSlope = height / width;
  gAngleOffset = atan(gSlope);
  noStroke();

  gMaskLayer = createGraphics(width, height);
  gMaskLayer.noStroke();

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
  setTextProps(gMaskLayer, gFontBlock, CENTER, CENTER, gFirstName.tsize, 0.7);
  addText(gMaskLayer, gFirstName.tstring, width / 2, height / 2, gAngleOffset);

  image(gMaskLayer, 0, 0);
}

function createPoemLines() {
  let wrapLength = 0.1 * width;
  let spacing = width / gPoemData.length;
  let angle = (floor(random(4)) * PI) / 2 + PI / 2 + gAngleOffset;

  let poemLinesLayer = createGraphics(width, height);
  setTextProps(poemLinesLayer, gFontThin, CENTER, CENTER);

  poemLinesLayer.noStroke();
  poemLinesLayer.blendMode(MULTIPLY);

  let x = 0;
  let colIndex = floor(random(gPalette.length));
  for (let line of gPoemData) {
    let tsize = random(0.01, 0.02) * width;
    setTextSizeProps(poemLinesLayer, tsize, 0.8);
    poemLinesLayer.fill(gPalette[colIndex]);

    x += (random(5) * spacing) / 5;
    let y = gSlope * x + 0.1 * height;
    let wrapOffset = random(0.5, 1) * wrapLength;

    poemLinesLayer.push();
    poemLinesLayer.translate(x, y);
    poemLinesLayer.rotate((floor(random(4)) * PI) / 2 + PI / 2 + gAngleOffset);
    //angle);
    poemLinesLayer.text(line, 0, random(-2, 2) * gTitle.tsize, wrapOffset);
    poemLinesLayer.pop();

    angle += PI / 2;
    x += spacing;
    colIndex = (colIndex + 1) % gPalette.length;
  }

  image(poemLinesLayer, 0, 0);
}

function setLayerProps(layer, blendMode, isErase) {
  layer.blendMode(blendMode);
  if (isErase) layer.erase();
  else layer.noErase();
}

function setTextProps(layer, font, alignX, alignY, size, leading) {
  layer.textFont(font);
  layer.textAlign(alignX, alignY);
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
  setTextProps(this, gFontBlock, LEFT, CENTER, gLastName.tsize, 0.8);
  push();
  addText(this, gLastName.tstring, 0.7 * width, 0.55 * height, gAngleOffset - PI / 2, -1, gPalette[colIndex], false);

  setTextProps(this, gFontThin, RIGHT, TOP, gTitle.tsize, 0.8);
  addText(
    this,
    gTitle.tstring,
    0,
    0,
    PI,
    0.3 * width,
    gSecondaryPalette[gColIndexStart % gSecondaryPalette.length],
    false,
    -0.3 * width,
    gTitle.tsize
  );

  pop();
}

function drawRects() {
  let spacing = width / 4;
  let isExtraRotated = false;
  let colIndex = gColIndexStart; //floor(random(gPalette.length));
  for (let i = 0; i < 3; i++) {
    gMaskLayer.push();
    gMaskLayer.translate(spacing * (i + 1), i < 2 ? random(0.8 * height) : random(height / 3, height / 2));
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
    gPoemData = data[0].lines.slice(0, 45);

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
