// Created for the #WCCChallenge - Electric Growth
// Electric (sketch inspired by EL wire, the line paths inspired by circuit diagrams) - Growth (flower nodes)

let neonPalette = ['#00ff53']; //'#da00eb', '#ff6255', '#ff009d', '#00ff53', '#01fd9a'];
let neonColorRGB;

let startX, startY;

let isVertical = true;
let allSegments = [];
let quadrants = [0, 0, 0, 0];

let gBoundsX = { min: 0, max: 0 };
let gBoundsY = { min: 0, max: 0 };

function setup() {
  // init canvas/draw settings
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  strokeWeight(6);
  strokeJoin(ROUND);
  noFill();
  noLoop();

  // pick a color
  let neonColorStr = random(neonPalette);
  neonColor = color(neonColorStr);
  neonColorRGB = { r: red(neonColor), g: green(neonColor), b: blue(neonColor) };

  // initialize start point to canvas center
  startX = width / 2;
  startY = height / 2;

  gBoundsX.min = width * 0.1;
  gBoundsX.max = width * 0.9;
  gBoundsY.min = height * 0.1;
  gBoundsY.max = height * 0.9;

  // create first segment
  createSegment();
}

function draw() {
  background(0);

  // Draw segments

  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = neonColor;
  let shouldCreateSegment = false;
  for (let i = 0; i < allSegments.length; i++) {
    let segment = allSegments[i];
    updateStrokeColor(segment.alphaFinal);

    // if the segment has finished drawing itself, flag to begin a new one
    shouldCreateSegment = segment.drawSegment();

    // remove segment from array after it has finished fading out
    if (segment.alphaVal <= 0) {
      allSegments.splice(i, 1);
      i--;
    }
  }

  if (shouldCreateSegment) {
    createSegment();
  }
}

function mouseClicked() {
  loop();
}

function createSegment() {
  // get lowest Quadrant Values
  let lowestQuadValue = 9999999;
  let lowestQuads = [];
  for (let i = 0; i < quadrants.length; i++) {
    let currentVal = quadrants[i];
    if (currentVal <= lowestQuadValue) {
      if (currentVal === lowestQuadValue) {
        lowestQuads.push(i);
      } else {
        lowestQuads = [i];
        lowestQuadValue = currentVal;
      }
    }
  }
  let quadIndex = random(lowestQuads);
  quadrants[quadIndex] += 1;

  let segment = new Segment(startX, startY, isVertical, quadIndex, gBoundsX, gBoundsY);
  allSegments.push(segment);

  // Make next segment begins at the end of current segment
  startX = segment.endX;
  startY = segment.endY;
}

function updateStrokeColor(alphaVal) {
  let newColor = color(neonColorRGB.r, neonColorRGB.g, neonColorRGB.b, alphaVal);
  stroke(newColor);
}
