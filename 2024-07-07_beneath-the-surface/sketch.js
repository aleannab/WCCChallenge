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
let gBoat;

let gTentacles = [];
let noiseMax = 5;
let gCreatureRadius = 100;
let gCreaturePosition;
let gSeaCreature;

let gAgents = [];
let gAgentCount = 100;
let gAgentBoatRef;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 100);

  curveTightness(1);
  strokeWeight(2);
  strokeCap(SQUARE);

  let maxWidth = windowWidth < windowHeight ? windowHeight : windowWidth;

  stroke(gWaterStroke);
  noFill();

  noiseDetail(4, 0.5);

  for (let i = 0; i < gAgentCount; i++) {
    gAgents.push(new Agent(random(width), random(height)));
  }

  gBoatPosition = getRulesOfThirdsPos();
  gAgents.push(new Agent(gBoatPosition.x, gBoatPosition.y));
  gAgentBoatRef = gAgents.length - 1;
  gCreaturePosition = getRulesOfThirdsPos();

  gSeaCreature = new SeaCreature(maxWidth);
  gBoat = new Boat(40, 100);
}

function getRulesOfThirdsPos() {
  const p0 = floor(random(1, 3));
  const p1 = floor(random(1, 3));
  return createVector(0.33 * p0 * width, 0.33 * p1 * height);
}

function draw() {
  background(gWaterColor);

  gSeaCreature.draw();

  drawWater();

  gBoat.draw();
}

function drawWater() {
  let voronoi = new c2.Voronoi();
  voronoi.compute(gAgents);
  let regions = voronoi.regions;

  curveTightness(1);
  for (let i = 0; i < regions.length; i++) {
    drawPolygon(regions[i].vertices);
  }

  for (let i = 0; i < gAgents.length; i++) {
    gAgents[i].update();
  }
}

function drawPolygon(vertices) {
  stroke(gWaterStroke);

  fill(gWaterColor);
  beginShape();
  for (let v of vertices) vertex(v.x, v.y);
  endShape(CLOSE);
}

class SeaCreature {
  constructor(maxWidth) {
    this.tentacles = [];
    for (let i = 0; i < 8; i++) {
      this.tentacles.push(new Tentacle(maxWidth, random(TWO_PI)));
    }

    this.blobPts = [];
    let num = 15;
    let angleInc = TWO_PI / num;
    for (let i = 0; i < num; i++) {
      let angle = i * angleInc;
      let xoff = map(cos(angle), -1, 1, 0, noiseMax);
      let yoff = map(sin(angle), -1, 1, 0, noiseMax);
      let r = map(noise(xoff, yoff), 0, 1, gCreatureRadius, gCreatureRadius * 1.5);
      let x = r * cos(angle);
      let y = r * sin(angle);
      this.blobPts.push(createVector(x, y));
    }
  }

  draw() {
    stroke(0);
    fill(0);

    push();
    translate(gCreaturePosition.x, gCreaturePosition.y);
    let t = millis() * 0.00001;
    rotate(PI * noise(t));

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
    this.control1X = length * random() * cos(angle + PI / 4);
    this.control1Y = length * random() * sin(angle + PI / 4);
    this.control2X = length * random() * cos(angle - PI / 4);
    this.control2Y = length * random() * sin(angle - PI / 4);
    this.endX = length * cos(angle);
    this.endY = length * sin(angle);
    this.sizeMax = random(0.8, 0.5);

    this.timeScalar = millis() * 0.001;
  }

  draw() {
    stroke(0);
    fill(0);
    // strokeWeight(this.strokeWeight);
    push();
    this.timeScalar = millis() * 0.0001;

    let numPoints = 200;
    for (let t = 0; t <= 1; t += 1 / numPoints) {
      let x = bezierPoint(0, this.adjust(this.control1X), this.adjust(this.control2X), this.adjust(this.endX), t);
      let y = bezierPoint(0, this.adjust(this.control1Y), this.adjust(this.control2Y), this.adjust(this.endY), t);
      ellipse(x, y, map(t, 0, 1, this.sizeMax, 0.1) * gCreatureRadius);
    }
    pop();
  }

  adjust(x) {
    return x + 200 * sin(x / width + this.timeScalar);
  }
}

class Boat {
  constructor(boatWidth, boatHeight) {
    this.boatWidth = boatWidth;
    this.boatHeight = boatHeight;
    this.angle = random(TWO_PI);
    this.boatPts = [
      createVector(-boatWidth / 2, boatHeight / 2),
      createVector(-boatWidth / 2, boatHeight / 2),
      createVector(-boatWidth / 2, 0),
      createVector(boatWidth / 2, 0),
      createVector(boatWidth / 2, boatHeight / 2),
      createVector(0, boatHeight),
      createVector(-boatWidth / 2, boatHeight / 2),
    ];
  }

  draw() {
    curveTightness(0.3);
    fill(gBoatDarkColor);
    stroke(gBoatColor);
    push();

    let t = millis() * 0.001;
    translate(gAgents[gAgentBoatRef].x, gAgents[gAgentBoatRef].y);
    rotate(this.angle + 0.1 * noise(0.005 * t));

    beginShape();
    strokeWeight(5);
    this.boatPts.forEach((pt) => {
      curveVertex(pt.x, pt.y);
    });
    endShape(CLOSE);
    strokeWeight(10);
    line(-this.boatWidth / 2, this.boatHeight / 4, this.boatWidth / 2, this.boatHeight / 4);
    noStroke();
    fill('#cd364e');
    ellipse(0, this.boatHeight / 4, 30, 10);
    fill(0);
    ellipse(0, this.boatHeight / 4 + 4, 15);
    pop();
  }
}

// From c2 library samples
class Agent extends c2.Point {
  constructor(xp, yp) {
    let x = xp;
    let y = yp;
    super(x, y);

    this.initPosition = createVector(x, y);
  }

  update() {
    let t = millis() * 0.01;
    this.x = this.initPosition.x + 100 * noise(0.005 * t + this.initPosition.x);
    this.y = this.initPosition.y + 100 * noise(0.005 * t + this.initPosition.y);

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
