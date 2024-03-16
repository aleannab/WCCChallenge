// Created for the #WCCChallenge

let gMaskLayer;

let gImg;
let gPoemData = [];
let gFirstName;
let gLastName;
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

  textLeading(0.8 * gLastName.tsize);
  push();
  translate(0.7 * width, 0.6 * height);
  textSize(gLastName.tsize);
  rotate(gAngleOffset - PI / 2);
  text(gLastName.tstring, 0, 0);
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

    let fullName = data[0].author;
    let first = fullName.split(' ')[0]; //gAlpha.charAt(floor(random(gAlpha.length)));

    let last = addLineBreaks(fullName.split(' ').slice(1).join(' '));
    let lSize = 1.2 * getFontSize(first, width);
    let rSize = 1.2 * getFontSize(last.split('\n')[0], height / 3);

    gFirstName = { tstring: first, tsize: lSize };
    gLastName = { tstring: last, tsize: rSize };
  } else {
    gPoemData = { lines: ['No poem found.'] };
  }
  drawPoster();
}

function mouseClicked() {
  createNewArt();
}
