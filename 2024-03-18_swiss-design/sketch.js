// Created for the #WCCChallenge

let gMaskLayer;

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
  textAlign(LEFT, CENTER);
  noStroke();

  gAngleOffset = atan(height / width);

  gMaskLayer = createGraphics(width, height);

  gMaskLayer.fill(255);
  gMaskLayer.noStroke();
  gMaskLayer.textFont(gFontBlock);
  gMaskLayer.textAlign(CENTER, CENTER);

  gPoetIndex = floor(random(gPoets.length));

  createNewArt();
}

function drawPoster() {
  background(0);

  gMaskLayer.background('#e0e5db');
  gMaskLayer.erase();

  let angle = gAngleOffset;
  let xp = width / 2;
  let yp = height / 2;
  gMaskLayer.textLeading(0.7 * gFirstName.tsize);
  gMaskLayer.push();
  gMaskLayer.translate(xp, yp);
  gMaskLayer.textSize(gFirstName.tsize);
  gMaskLayer.rotate(angle);
  gMaskLayer.text(gFirstName.tstring, 0, 0);
  gMaskLayer.pop();

  textWrap(WORD);
  textFont(gFontReg);

  let wrapLength = 0.1 * width;
  let spacing = width / gPoemData.length;
  xp = 0;
  for (let line of gPoemData) {
    if (random() > 0.8) line = addLineBreaks(line);
    fill(random(gPalette));
    push();
    translate(xp, xp + random(-0.2, 0.2) * height);
    rotate(floor(random(2)) * PI + PI / 2 + gAngleOffset);
    let tsize = random(0.01, 0.02) * width;
    textSize(tsize);
    textLeading(0.8 * tsize);
    text(line, 0, 0, random(1, 2) * wrapLength);
    pop();
    xp += spacing;
  }
  image(gMaskLayer, 0, 0);

  textFont(gFontBlock);
  textLeading(0.8 * gLastName.tsize);
  push();
  translate(0.7 * width, 0.55 * height);
  textSize(gLastName.tsize);
  rotate(gAngleOffset - PI / 2);
  let colIndex = floor(random(gPalette.length));
  fill(gPalette[colIndex]);
  text(gLastName.tstring, 0, 0);
  rotate(PI);
  fill(gPalette[(colIndex + gPalette.length - 1) % gPalette.length]);
  textFont(gFontThin);
  textSize(gTitle.tsize);
  textLeading(0.8 * gTitle.tsize);
  textAlign(RIGHT, TOP);
  text(gTitle.tstring, -0.3 * width, gTitle.tsize, 0.3 * width);
  pop();
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
}

function getPoem() {
  let url = 'https://poetrydb.org/random,author/2;' + gPoets[gPoetIndex];
  loadJSON(url, recievedPoem);
}

function recievedPoem(data) {
  if (data && data.length > 0) {
    gPoemData = data[0].lines.slice(0, 50);

    let fullName = data[0].author;
    let first = fullName.split(' ')[0]; //gAlpha.charAt(floor(random(gAlpha.length)));
    let title = data[0].title;

    let last = addLineBreaks(fullName.split(' ').slice(1).join(' '));
    let lSize = 1.2 * getFontSize(first, width);
    let rSize = 1.75 * getFontSize(last.split('\n')[0], height / 3);
    let tSize = max(rSize / 3, getFontSize(title, height / 3));

    gFirstName = { tstring: first, tsize: lSize };
    gLastName = { tstring: last, tsize: rSize };
    gTitle = { tstring: title, tsize: tSize };
  } else {
    gPoemData = { lines: ['No poem found.'] };
  }
  drawPoster();
}

function mouseClicked() {
  createNewArt();
}
