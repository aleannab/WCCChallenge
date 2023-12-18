// Created for the #WCCChallenge - Electric Growth
// Electric (sketch inspired by EL wire, the line paths inspired by circuit diagrams) - Growth (flower nodes)

let neonPalette = ['#da00eb', '#ff6255', '#ff009d', '#00ff53', '#01fd9a'];
let neonColorRGB;

let startX, startY;

let isVertical = true;
let allSegments = [];

function setup() {
  // init canvas/draw settings
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  strokeWeight(3);
  strokeJoin(ROUND);
  noFill();

  // pick a color
  let neonColorStr = random(neonPalette);
  neonColor = color(neonColorStr);
  neonColorRGB = { r: red(neonColor), g: green(neonColor), b: blue(neonColor) };

  // initialize start point to canvas center
  startX = width / 2;
  startY = height / 2;

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

function createSegment() {
  let segment = new Segment(startX, startY, isVertical);
  allSegments.push(segment);

  // Make next segment begins at the end of current segment
  startX = segment.endX;
  startY = segment.endY;
}

function updateStrokeColor(alphaVal) {
  let newColor = color(neonColorRGB.r, neonColorRGB.g, neonColorRGB.b, alphaVal);
  stroke(newColor);
}
