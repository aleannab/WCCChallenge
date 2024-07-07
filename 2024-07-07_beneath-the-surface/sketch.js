// by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Beneath the Surface
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

//Created by Ren Yuan

let gWaterColor = '#a4e0ccf0';
let gWaterStroke = '#bff2d8';

let tentacles = [];
let noiseMax = 5;
let blobRadius = 100;
let tentacleLength = 500;

class Agent extends c2.Point {
  constructor() {
    let x = random(width);
    let y = random(height);
    super(x, y);

    let offset = 0.1;
    this.vx = random(-offset, offset);
    this.vy = random(-offset, offset);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) {
      this.x = 0;
      this.vx *= -1;
    } else if (this.x > width) {
      this.x = width;
      this.vx *= -1;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vy *= -1;
    } else if (this.y > height) {
      this.y = height;
      this.vy *= -1;
    }
  }

  display() {
    // stroke('#333333');
    // strokeWeight(5);
    // point(this.x, this.y);
  }
}

let agents = new Array(100);

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 100);

  curveTightness(1);
  strokeWeight(2);
  strokeCap(SQUARE);

  stroke(gWaterStroke);
  noFill();

  noiseDetail(4, 0.5);
  // Generate tentacle angles
  for (let i = 0; i < 8; i++) {
    tentacles.push(random(TWO_PI));
  }

  for (let i = 0; i < agents.length; i++) agents[i] = new Agent();
}

function draw() {
  background(gWaterColor);

  drawCreature();

  let voronoi = new c2.Voronoi();
  voronoi.compute(agents);
  let regions = voronoi.regions;

  let rectangle = new c2.Rect(0, 0, width, height);

  let maxArea = 0;
  let minArea = Number.POSITIVE_INFINITY;
  for (let i = 0; i < regions.length; i++) {
    let clip = rectangle.clip(regions[i]);
    if (clip != null) regions[i] = clip;

    let area = regions[i].area();
    if (area < minArea) minArea = area;
    if (area > maxArea) maxArea = area;
  }

  curveTightness(1);
  for (let i = 0; i < regions.length; i++) {
    let t = norm(regions[i].area(), minArea, maxArea);
    drawPolygon(regions[i].vertices);
  }

  for (let i = 0; i < agents.length; i++) {
    agents[i].display();
    // agents[i].update();
  }

  drawBoat(width / 2, height / 2, 40, 100, 60, 10); // Draw the boat in the center
}

function drawPolygon(vertices) {
  stroke(gWaterStroke);

  fill(gWaterColor);
  beginShape();
  for (let v of vertices) curveVertex(v.x, v.y);
  endShape(CLOSE);
}

function drawCreature() {
  fill(0);

  push();

  translate(width / 2, height / 2);
  // Draw blob
  beginShape();
  for (let angle = 0; angle < TWO_PI; angle += 0.1) {
    let xoff = map(cos(angle), -1, 1, 0, noiseMax);
    let yoff = map(sin(angle), -1, 1, 0, noiseMax);
    let r = map(noise(xoff, yoff), 0, 1, blobRadius * 0.8, blobRadius);
    let x = r * cos(angle);
    let y = r * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);

  noFill();
  stroke(0);
  strokeWeight(30);

  // Draw tentacles
  for (let i = 0; i < tentacles.length; i++) {
    let angle = tentacles[i];
    let xoff = map(cos(angle), -1, 1, 0, noiseMax);
    let yoff = map(sin(angle), -1, 1, 0, noiseMax);
    let r = map(noise(xoff, yoff), 0, 1, blobRadius * 0.8, blobRadius);
    let startX = r * cos(angle);
    let startY = r * sin(angle);

    // Calculate control points for bezier curve
    let control1X = startX + tentacleLength * 0.3 * cos(angle + PI / 4);
    let control1Y = startY + tentacleLength * 0.3 * sin(angle + PI / 4);
    let control2X = startX + tentacleLength * 0.6 * cos(angle - PI / 4);
    let control2Y = startY + tentacleLength * 0.6 * sin(angle - PI / 4);
    let endX = startX + tentacleLength * cos(angle);
    let endY = startY + tentacleLength * sin(angle);

    bezier(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY);
  }
  pop();
}

function drawBoat(x, y, boatWidth, boatHeight) {
  // Draw boat hull
  curveTightness(0.3);
  fill('#d5d1c3'); // Brown color for the hull
  push();
  translate(x, y);
  beginShape();
  // noStroke();
  stroke('#f3f3f4');
  strokeWeight(5);
  curveVertex(-boatWidth / 2, boatHeight / 2);
  curveVertex(-boatWidth / 2, boatHeight / 2);
  curveVertex(-boatWidth / 2, 0);
  curveVertex(boatWidth / 2, 0);
  curveVertex(boatWidth / 2, boatHeight / 2);
  curveVertex(0, boatHeight);
  curveVertex(-boatWidth / 2, boatHeight / 2);
  endShape(CLOSE);
  strokeWeight(10);
  line(-boatWidth / 2, boatHeight / 4, boatWidth / 2, boatHeight / 4);
  noStroke();
  fill('#cd364e');
  ellipse(0, boatHeight / 4, 30, 10);
  fill(0);
  ellipse(0, boatHeight / 4 + 4, 15);
  pop();
}
