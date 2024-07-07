// by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Beneath the Surface
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

//Created by Ren Yuan

let gWaterColor = '#a4e0ccf0';
let gWaterStroke = '#bff2d8';

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
  stroke(gWaterStroke);
  noFill();

  for (let i = 0; i < agents.length; i++) agents[i] = new Agent();
}

function draw() {
  background(gWaterColor);

  fill(0);

  circle(width / 2, height / 2, 100);

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
  fill(gWaterColor);
  beginShape();
  for (let v of vertices) curveVertex(v.x, v.y);
  endShape(CLOSE);
}

function drawBoat(x, y, boatWidth, boatHeight, oarLength, oarWidth) {
  // Draw boat hull
  curveTightness(0.3);
  fill(139, 69, 19); // Brown color for the hull
  push();
  translate(x, y);
  beginShape();
  noStroke();
  curveVertex(-boatWidth / 2, boatHeight / 2);
  curveVertex(-boatWidth / 2, boatHeight / 2);
  curveVertex(-boatWidth / 2, 0);
  curveVertex(boatWidth / 2, 0);
  curveVertex(boatWidth / 2, boatHeight / 2);
  curveVertex(0, boatHeight);
  curveVertex(-boatWidth / 2, boatHeight / 2);

  endShape(CLOSE);
  pop();
}
