// Two by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: My Kid Could Draw That
//
// This is inspired by my toddler's artwork. He is two. 🖍️💖
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gMarkerBox = ['#ec3113', '#ff6600', '#fef008', '#089109', '#0db9d1', '#0b0ac4', '#d212a9', '#9a20fe', '#1f1f1f'];

let gPalette = [];
let gBgColor = '#e7e7e9';

let gStrokeWeight = 10;

let gUnit;

function setup() {
  createCanvas(1080, 1250); //windowWidth, windowHeight);
  noLoop();
  noFill();

  angleMode(DEGREES);
  gUnit = 0.1 * height;
}

function draw() {
  startNewPicture();

  let markerChangeCount = int(random(50, 100));
  for (let i = 0; i < markerChangeCount; i++) {
    pickUpNewMarker();
  }
}

function startNewPicture() {
  setPalette();
  blendMode(BLEND);

  background(gBgColor);
  blendMode(DARKEST);
}

function setPalette() {
  gMarkerBox = shuffle(gMarkerBox);
  gPalette = gMarkerBox.slice(0, 5);
}

function pickUpNewMarker() {
  stroke(random(gPalette));
  push();
  translate(random(width), random(0.8 * height));
  rotate(random(-45, 45));
  if (randBool()) {
    scribbleLines();
  } else {
    scribble();
  }
  pop();
}

function scribble() {
  strokeWeight(random(0.8, 1.2) * gStrokeWeight);

  beginShape();
  curveTightness(random(-1, 0.6));

  let steps = int(random(20, 100));

  let angle = 0;
  let maxLoops = 5;
  let angleMax = 360 * maxLoops;

  let xOffset = 0;
  let yOffset = 0;
  let r = random(0.5, 2) * gUnit;

  for (let i = 0; i < steps; i++) {
    let xPos = r * cos(angle) + xOffset;
    let yPos = r * sin(angle) + yOffset;

    curveVertex(xPos, yPos);
    angle += random(30, 100);
    r += random(-0.1, 0.1) * gUnit;
    xOffset += random(-0.2, 0.2) * gUnit;
    yOffset += random(-0.2, 0.3) * gUnit;
    if (angle > angleMax) break;
  }

  endShape();
}

function scribbleLines() {
  let lineCount = int(random(1, 10));

  for (let lineNum = 0; lineNum < lineCount; lineNum++) {
    beginShape();
    strokeWeight(random(0.8, 1.2) * gStrokeWeight);

    let ptCount = int(random(5, 8));
    let pt = createVector(random(gUnit), random(-0.1, 0.8) * gUnit);

    for (let i = 0; i < ptCount; i++) {
      curveVertex(pt.x, pt.y);
      pt.x += random(-0.2, 0.2) * gUnit;
      pt.y += random(0.5, 1) * gUnit;
    }
    endShape();
  }
}

function calculateControlPoints(start, end, offsetX, offsetY) {
  let controlPoint1 = createVector(start.x + offsetX, start.y + offsetY);
  let controlPoint2 = createVector(end.x - offsetX, end.y - offsetY);
  return [controlPoint1, controlPoint2];
}

function mousePressed() {
  redraw();
}

function keyPressed() {
  if (key === 's') {
    console.log('image saved');
    let timestamp = year() + '-' + nf(month(), 2) + '-' + nf(day(), 2) + '_' + nf(hour(), 2) + '-' + nf(minute(), 2) + '-' + nf(second(), 2);
    saveCanvas('my-kid-could' + timestamp);
  } else if (key === 'r') {
    redraw();
  }
}

function randBool() {
  return random() < 0.5;
}
