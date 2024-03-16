// Created for the #WCCChallenge

let gMaskLayer;

let gImg;
let gPoemData = [];
let gMaskText;
let gFont;
let gAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let gPalette = ['#00b8b8', '#e4bd0b', '#de3d83'];
let gAngleOffset;

let gRandomSeed = 0;

function preload() {
  gFont = loadFont('Roboto-Black.ttf');
}

function setup() {
  let h = windowHeight < windowWidth ? windowHeight : 0.707 * windowWidth;
  let w = windowHeight < windowWidth ? 1.414 * windowHeight : windowWidth;
  createCanvas(0.9 * w, 0.9 * h);
  textFont(gFont);
  textAlign(LEFT, CENTER);
  noStroke();

  gAngleOffset = atan(height / width);

  gMaskLayer = createGraphics(width, height);

  gMaskLayer.fill(255);
  gMaskLayer.noStroke();
  gMaskLayer.textFont(gFont);
  gMaskLayer.textAlign(CENTER, CENTER);

  createNewArt();
}

function drawPoster() {
  background(0);

  gMaskLayer.background('#e0e5db');
  gMaskLayer.erase();
  gMaskLayer.textLeading(0.7 * gMaskText.tsize);
  gMaskLayer.textSize(gMaskText.tsize);
  gMaskLayer.push();
  gMaskLayer.translate(width / 2, height / 2);
  gMaskLayer.rotate(gAngleOffset);
  gMaskLayer.text(gMaskText.tstring, 0, 0);
  gMaskLayer.pop();

  for (let line of gPoemData) {
    if (random() > 0.8) line = addLineBreaks(line);
    fill(random(gPalette));
    push();
    translate(random(width), random(height));
    rotate((floor(random(4)) * PI) / 2 + gAngleOffset);
    textSize(random(0.01, 0.02) * width);
    text(line, 0, 0);
    pop();
  }
  image(gMaskLayer, 0, 0);
}

function addLineBreaks(inputString) {
  let words = inputString.split(' ');

  return words.join('\n');
}

function getFontSize(textString, length) {
  fontSize = 100;
  textSize(fontSize);
  let tw = textWidth(textString);

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
}

function getPoem() {
  let url = 'https://poetrydb.org/random/1';
  loadJSON(url, recievedPoem);
}

function recievedPoem(data) {
  if (data && data.length > 0) {
    gPoemData = data[0].lines.slice(0, 50);

    let firstName = data[0].author.split(' ')[0]; //gAlpha.charAt(floor(random(gAlpha.length)));
    let lSize = 1.2 * getFontSize(firstName, width);

    gMaskText = { tstring: firstName, tsize: lSize };
  } else {
    gPoemData = { lines: ['No poem found.'] };
  }
  drawPoster();
}

function mouseClicked() {
  createNewArt();
}
