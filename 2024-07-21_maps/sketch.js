// River City by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: City Map
//
// Felt like a voronoi pattern was an apt approach again for this challenge.
//
// Region boundaries are made from a voronoi diagram using c2.js.
// I used this example as a launch off point.
// https://renyuan.io/c2.js/examples.html?name=Voronoi
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

// let gWaterColor = '#d8e2dc';
// let gRoadColor = '#52513f';
// let gColorPalette = ['#f8edeb', '#fae1dd', '#ded6ce', '#fec5bb', '#f5ebe0'];
let gWaterColor = '#d8e2dc';
let gLandColor = '#000000';
let gRoadColor = '#ffffff';
let gColorPalette = ['#000000'];

let gPalette = [];

let gAgents = [];
let gAgentCount;

let gRiver;

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (3 * windowHeight) / 4;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.95 * w, 0.95 * h);

  initializeScene();
  noLoop();
}

function draw() {
  background(gLandColor);
  drawRegions();
  gRiver.draw();
}

function initializeScene() {
  gridPattern = createGridPattern(width, height);
  gAgentCount = 50;

  gAgents = [];

  for (let i = 0; i < gAgentCount; i++) {
    gAgents.push(new Agent(random(width), random(height)));
  }

  gRiver = new River(2 * width, random(TWO_PI));
}

function createGridPattern(w, h) {
  let pg = createGraphics(w, h);
  pg.background(random(gColorPalette));
  pg.stroke(gRoadColor);
  pg.strokeWeight(random(0.5, 1.5));
  let gridSize = random(10, 20);
  for (let x = 0; x < w; x += gridSize) {
    pg.line(x, 0, x, h);
  }

  let yInc = random(0.4, 0.8) * gridSize;
  for (let y = 0; y < h; y += yInc) {
    pg.line(0, y, w, y);
  }
  return pg;
}

function mouseClicked() {
  initializeScene();
  redraw();
}

function drawRegions() {
  blendMode(MULTIPLY);

  let voronoi = new c2.Voronoi();
  voronoi.compute(gAgents);
  voronoi.regions.forEach((region) => {
    drawPolygon(region.vertices);
  });
}

function drawPolygon(vertices) {
  let mask = createGraphics(width, height);
  mask.beginShape();
  for (let v of vertices) mask.vertex(v.x, v.y);
  mask.endShape(CLOSE);

  // Find the longest polygon side
  let longestSide = { length: 0, angle: 0 };
  for (let i = 0; i < vertices.length; i++) {
    let v1 = vertices[i];
    let v2 = vertices[(i + 1) % vertices.length];
    let length = dist(v1.x, v1.y, v2.x, v2.y);
    if (length > longestSide.length) {
      longestSide.length = length;
      longestSide.angle = atan2(v2.y - v1.y, v2.x - v1.x);
    }
  }

  // Create rotated grid pattern tangent to longest side
  let rotatedGrid = createGraphics(width * 2, height * 2);
  rotatedGrid.translate(rotatedGrid.width / 2, rotatedGrid.height / 2);
  rotatedGrid.rotate(longestSide.angle);
  rotatedGrid.imageMode(CENTER);
  let maskedImage = createGridPattern(width, height);
  rotatedGrid.image(maskedImage, 0, 0, rotatedGrid.width, rotatedGrid.height);

  let gridImageFinal = rotatedGrid.get((rotatedGrid.width - width) / 2, (rotatedGrid.height - height) / 2, width, height);
  let maskImage = mask.get();
  gridImageFinal.mask(maskImage);

  // Draw streets
  image(gridImageFinal, 0, 0);

  // Draw boundary
  blendMode(NORMAL);
  strokeWeight(3);
  stroke(gRoadColor);
  noFill();
  beginShape();
  for (let v of vertices) vertex(v.x, v.y);
  endShape(CLOSE);
}

class Agent extends c2.Point {
  constructor(xp, yp) {
    let x = xp;
    let y = yp;
    super(x, y);

    this.initPosition = createVector(x, y);
  }
}

class River {
  constructor(length, angle) {
    this.angle = angle;
    this.control1X = length * random() * cos(PI / 4);
    this.control1Y = length * random() * sin(PI / 4);
    this.control2X = length * random() * cos(PI / 4);
    this.control2Y = length * random() * sin(PI / 4);
    this.endX = length * cos(0);
    this.endY = length * sin(0);
    this.sizeMin = 0.1 * width;
    this.sizeMax = 0.2 * width;
  }

  draw() {
    blendMode(NORMAL);

    noStroke();
    fill(gWaterColor);
    push();
    translate(width / 2, height / 2);
    rotate(random(TWO_PI));

    let numPoints = 200;
    beginShape();
    for (let t = 0; t <= 1; t += 1 / numPoints) {
      let x = bezierPoint(-width / 2, this.control1X, this.control2X, this.endX, t);
      let y = bezierPoint(-height / 2, this.control1Y, this.control2Y, this.endY, t);
      ellipse(x, y, map(noise(t), 0, 1, 30, 200));
    }
    endShape();
    pop();
  }
}
