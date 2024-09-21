// Two by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: My Kid Could Draw That
//
// This is inspired by my toddler's artwork. He is two. <3
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gPalette = ['#ec3113', '#ff6600', '#fef008', '#089109', '#0db9d1', '#0b0ac4', '#d212a9', '#9a20fe', '#1f1f1f'];
let gBgColor = '#e7e7e9';

let gStrokeWeight = 15;

let gUnit;

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (3 * windowHeight) / 4;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.95 * w, 0.95 * h);
  noLoop();
  noFill();

  angleMode(DEGREES);
  gUnit = 0.1 * h;
}

function draw() {
  noStroke();
  background(gBgColor);

  let crayonChangeCount = 30;
  for (let i = 0; i < crayonChangeCount; i++) {
    pickUpNewCrayon();
  }
}

function pickUpNewCrayon() {
  stroke(random(gPalette));
  strokeWeight(random(5, 8));

  push();
  translate(random(0.8 * width), random(0.5 * height));
  rotate(random(-45, 45));
  if (randBool()) {
    scribbleLines();
  } else {
    scribble();
  }
  pop();
}

function scribble() {
  beginShape();
  curveTightness(random(-1, 0.6));

  let steps = int(random(20, 100));

  let angle = 0;
  let maxLoops = 5;
  let angleMax = 360 * maxLoops;

  let xOffset = 0;
  let yOffset = 0;
  let r = random(0.5, 1) * gUnit;

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
    strokeWeight(5, 8);

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

function randBool() {
  return random() < 0.5;
}
