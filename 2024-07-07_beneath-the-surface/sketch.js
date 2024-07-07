// by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Beneath the Surface
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

//Created by Ren Yuan

let gWaterColor = '#a4e0ccf0';
let gWaterStroke = '#bff2d8';

let gBoatColor = '#f3f3f4';
let gBoatDarkColor = '#d5d1c3';
let gBoatPosition;

let gTentacles = [];
let noiseMax = 5;
let gCreatureRadius = 100;
let gCreaturePosition;
let gTentacleLength;

let gAgents = new Array(100);

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 100);

  curveTightness(1);
  strokeWeight(2);
  strokeCap(SQUARE);

  gTentacleLength = windowWidth < windowHeight ? windowHeight : windowWidth;

  stroke(gWaterStroke);
  noFill();

  noiseDetail(4, 0.5);
  // Generate tentacle angles
  for (let i = 0; i < 8; i++) {
    gTentacles.push(random(TWO_PI));
  }

  for (let i = 0; i < gAgents.length; i++) gAgents[i] = new Agent();

  gBoatPosition = getRulesOfThirdsPos();
  gCreaturePosition = getRulesOfThirdsPos();
}

function getRulesOfThirdsPos() {
  const p0 = floor(random(1, 3));
  const p1 = floor(random(1, 3));
  return createVector(0.33 * p0 * width, 0.33 * p1 * height);
}

function draw() {
  background(gWaterColor);

  drawCreature();

  drawWater();

  drawBoat(40, 100);
}

function drawWater() {
  let voronoi = new c2.Voronoi();
  voronoi.compute(gAgents);
  let regions = voronoi.regions;

  curveTightness(1);
  for (let i = 0; i < regions.length; i++) {
    drawPolygon(regions[i].vertices);
  }
}

function drawPolygon(vertices) {
  stroke(gWaterStroke);

  fill(gWaterColor);
  beginShape();
  for (let v of vertices) vertex(v.x, v.y);
  endShape(CLOSE);
}

function drawCreature() {
  randomSeed(9);

  stroke(0);
  fill(0);

  push();
  translate(gCreaturePosition.x, gCreaturePosition.y);

  // Draw blob
  beginShape();
  let num = 15;
  let angleInc = TWO_PI / num;
  for (let i = 0; i < num; i++) {
    let angle = i * angleInc;
    let xoff = map(cos(angle), -1, 1, 0, noiseMax);
    let yoff = map(sin(angle), -1, 1, 0, noiseMax);
    let r = map(noise(xoff, yoff), 0, 1, gCreatureRadius, gCreatureRadius * 1.5);
    let x = r * cos(angle);
    let y = r * sin(angle);
    curveVertex(x, y);
  }
  endShape(CLOSE);

  // Draw tentacles
  noFill();

  for (let i = 0; i < gTentacles.length; i++) {
    let angle = gTentacles[i];
    strokeWeight(random(20, 50));

    let control1X = gTentacleLength * random() * cos(angle + PI / 4);
    let control1Y = gTentacleLength * random() * sin(angle + PI / 4);
    let control2X = gTentacleLength * random() * cos(angle - PI / 4);
    let control2Y = gTentacleLength * random() * sin(angle - PI / 4);
    let endX = gTentacleLength * cos(angle);
    let endY = gTentacleLength * sin(angle);

    bezier(0, 0, control1X, control1Y, control2X, control2Y, endX, endY);
  }
  pop();
}

function drawBoat(boatWidth, boatHeight) {
  curveTightness(0.3);
  fill(gBoatDarkColor);
  stroke(gBoatColor);

  push();

  translate(gBoatPosition.x, gBoatPosition.y);
  rotate(random(TWO_PI));

  beginShape();
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

// From c2 library samples
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
    stroke('#333333');
    strokeWeight(5);
    point(this.x, this.y);
  }
}
