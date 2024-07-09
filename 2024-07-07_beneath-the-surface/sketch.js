// Lurking by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Beneath the Surface
//
// This is a work-in-progress.
// I would still like to do the following:
// * Avoid the faster pivoting lines in the water texture if possible
//   (maybe by adjusting initial placement and/or movement of the voronoi control points)
// * Play more with color palette and boat design
//
// Water texture is made from a voronoi diagram using c2.js.
// I used this example as a launch off point.
// https://renyuan.io/c2.js/examples.html?name=Voronoi
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWaterColor = '#a4e0ccf0';
let gWaterPalette = ['#a4e0ccf0', '#a4dfccf0', '#a4e1ccf0', '#a4e0cbf0', '#a4e0cdf0'];

let gWaterStroke = '#bff2d8';

let gBoatColor = '#B8B29D';
let gBoatDarkColor = '#967653';
let gBoatPosition;
let gBoat;

let gTentacles = [];
let gCreatureRadius;
let gCreaturePosition;
let gSeaCreature;

let gAgents = [];
let gAgentCount;
let gAgentBoatRef;

let gTimeFactor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(2);
  strokeCap(SQUARE);

  stroke(gWaterStroke);
  noFill();

  noiseDetail(4, 0.5);

  initializeScene();
}

function draw() {
  gTimeFactor = millis() * 0.001;
  background(gWaterColor);

  gSeaCreature.draw();

  drawWater();

  gBoat.draw();
}

function initializeScene() {
  let maxWidth = windowWidth < windowHeight ? windowHeight : windowWidth;

  gCreatureRadius = 0.08 * maxWidth;
  gSeaCreature = new SeaCreature(maxWidth * 0.8);
  let bLength = 0.04 * maxWidth;
  gBoat = new Boat(0.5 * bLength, bLength);
  gAgentCount = floor(4 * bLength);

  gAgents = [];
  for (let i = 0; i < gAgentCount; i++) {
    gAgents.push(new Agent(random(width), random(height)));
  }

  gBoatPosition = getRulesOfThirdsPos();
  gAgents.push(new Agent(gBoatPosition.x, gBoatPosition.y));
  gAgentBoatRef = gAgents.length - 1;
  gCreaturePosition = gBoatPosition.add(createVector(random(-100, 100), random(-100, 100)));
}

function mouseClicked() {
  initializeScene();
}

function drawWater() {
  let voronoi = new c2.Voronoi();
  voronoi.compute(gAgents);
  let regions = voronoi.regions;

  for (let i = 0; i < regions.length; i++) {
    fill(gAgents[i].color);
    drawPolygon(regions[i].vertices);
  }

  for (let i = 0; i < gAgents.length; i++) {
    gAgents[i].update();
  }
}

function drawPolygon(vertices) {
  stroke(gWaterStroke);

  // fill(gWaterColor);
  beginShape();
  for (let v of vertices) vertex(v.x, v.y);
  endShape(CLOSE);
}

function getRulesOfThirdsPos() {
  const p0 = floor(random(1, 3));
  const p1 = floor(random(1, 3));
  return createVector(0.33 * p0 * width, 0.33 * p1 * height);
}

class SeaCreature {
  constructor(maxWidth) {
    this.blobPts = [];
    let num = 15;
    let angleInc = TWO_PI / num;
    let noiseMax = 5;
    for (let i = 0; i < num; i++) {
      let angle = i * angleInc;
      let xoff = map(cos(angle), -1, 1, 0, noiseMax);
      let yoff = map(sin(angle), -1, 1, 0, noiseMax);
      let r = map(noise(xoff, yoff), 0, 1, gCreatureRadius, gCreatureRadius * 1.5);
      let x = r * cos(angle);
      let y = r * sin(angle);
      this.blobPts.push(createVector(x, y));
    }

    this.tentacles = [];
    let tAngle = random(TWO_PI);
    angleInc = TWO_PI / 8;
    for (let i = 0; i < 8; i++) {
      this.tentacles.push(new Tentacle(maxWidth, random(TWO_PI)));
      tAngle += random(0.2, 1) * angleInc;
    }
  }

  draw() {
    stroke(0);
    fill(0);

    push();
    translate(gCreaturePosition.x, gCreaturePosition.y);
    // rotate(PI * noise(0.01 * gTimeFactor));

    // Draw blob
    beginShape();
    this.blobPts.forEach((pt) => {
      curveVertex(pt.x, pt.y);
    });
    endShape(CLOSE);

    // Draw tentacles
    noFill();
    this.tentacles.forEach((tenti) => {
      tenti.draw();
    });

    pop();
  }
}

class Tentacle {
  constructor(length, angle) {
    this.angle = angle;
    this.control1X = length * random() * cos(PI / 4);
    this.control1Y = length * random() * sin(PI / 4);
    this.control2X = length * random() * cos(PI / 4);
    this.control2Y = length * random() * sin(PI / 4);
    this.endX = length * cos(0);
    this.endY = length * sin(0);
    this.sizeMax = random(0.8, 0.5);
    this.noiseSeed = random(999);
  }

  draw() {
    stroke(0);
    fill(0);
    push();
    rotate(this.angle);

    let numPoints = 200;
    for (let t = 0; t <= 1; t += 1 / numPoints) {
      let x = bezierPoint(0, this.control1X, this.control2X, this.endX, t);
      let y = bezierPoint(0, this.control1Y, this.adjust(this.control2Y), this.endY, t);
      ellipse(x, y, map(t, 0, 1, this.sizeMax, 0.1) * gCreatureRadius);
    }
    pop();
  }

  adjust(x) {
    randomSeed(x);
    let amplitude = random(200, 500);
    let frequency = random(0.1, 0.2);
    let phase = random(TWO_PI);

    let wobble = amplitude * sin(frequency * x + phase + 0.1 * gTimeFactor);
    return x + wobble;
  }
}

class Boat {
  constructor(boatWidth, boatHeight) {
    this.boatWidth = boatWidth;
    this.boatHeight = boatHeight;
    this.angle = random(TWO_PI);
    this.boatPts = [
      createVector(-0.5 * boatWidth, 0.6 * boatHeight),
      createVector(-0.5 * boatWidth, 0.6 * boatHeight),
      createVector(-0.5 * boatWidth, 0),
      createVector(0.5 * boatWidth, 0),
      createVector(0.5 * boatWidth, 0.6 * boatHeight),
      createVector(0.2 * boatWidth, boatHeight),
      createVector(-0.2 * boatWidth, boatHeight),
      createVector(-0.5 * boatWidth, 0.6 * boatHeight),
    ];
  }

  draw() {
    curveTightness(0.3);
    fill(gBoatDarkColor);
    stroke(gBoatColor);
    push();

    let t = millis() * 0.0001;
    translate(gAgents[gAgentBoatRef].x, gAgents[gAgentBoatRef].y);
    rotate(this.angle + 0.2 * noise(t));

    beginShape();
    strokeWeight(2);
    this.boatPts.forEach((pt) => {
      curveVertex(pt.x, pt.y);
    });
    endShape(CLOSE);
    strokeWeight(12);
    line(-this.boatWidth / 2, this.boatHeight / 4, this.boatWidth / 2, this.boatHeight / 4);

    //person
    noStroke();

    fill('#0f688b');
    ellipse(0, 0.45 * this.boatHeight, this.boatWidth * 0.5, this.boatWidth * 0.4);
    fill('#cd364e');
    ellipse(0, 0.3 * this.boatHeight, this.boatWidth * 0.8, this.boatWidth * 0.4);
    fill(0);
    ellipse(0, this.boatHeight / 3, this.boatWidth * 0.5);
    pop();
  }
}

class Agent extends c2.Point {
  constructor(xp, yp) {
    let x = xp;
    let y = yp;
    super(x, y);

    this.initPosition = createVector(x, y);
    this.color = random(gWaterPalette);
  }

  update() {
    let t = 0.05 * gTimeFactor;
    this.x = this.initPosition.x + 100 * noise(t + this.initPosition.x);
    this.y = this.initPosition.y + 100 * noise(t + this.initPosition.y);
  }

  display() {
    stroke('#333333');
    strokeWeight(5);
    point(this.x, this.y);
  }
}
