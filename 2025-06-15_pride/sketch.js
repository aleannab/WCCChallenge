// Created for the #WCCChallenge

let gFlagStripes = [];

function setup() {
  // keep flag aspect ratio
  let flagAspect = 3 / 2;
  let w = windowWidth;
  let h = w / flagAspect;
  if (h > windowHeight) {
    h = windowHeight;
    w = h * flagAspect;
  }

  createCanvas(w, h);

  strokeWeight(5);

  letsRiot();
}

function draw() {
  background(255);
  drawFlag();
}

function letsRiot() {
  createFlagStripe(color(0));
}

function createFlagStripe(col) {
  gFlagStripes.push(new FlagStripe(col));
}

function drawFlag() {
  for (let stripe of gFlagStripes) {
    stripe.drawLines();
  }
}

class FlagStripe {
  constructor(c) {
    this.stripeColor = c;
    this.stripeLines = [];

    this.createLines();
  }

  createLines() {
    this.stripeLines.push(new StripeLine(0));
  }

  drawLines() {
    for (let line of this.stripeLines) {
      line.draw();
    }
  }
}

class StripeLine {
  constructor(yp) {
    this.points = [];

    this.createLine(yp);
  }

  createLine() {
    for (let i = 0; i < 10; i++) {
      this.points.push(createVector(random(0.5 * width), random(height)));
    }

    this.points.push(createVector(0.5 * width, 0.5 * height));
    // this.points.push(createVector(0.5 * width, 0.5 * height));
    this.points.push(createVector(width, 0.5 * height));
    this.points.push(createVector(width, 0.5 * height));
  }

  draw() {
    beginShape();
    for (let pt of this.points) {
      curveVertex(pt.x, pt.y);
    }
    endShape();
  }
}
