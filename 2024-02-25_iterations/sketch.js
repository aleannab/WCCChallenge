// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gNumRows = 5;
let gNumCols = 6;
let gBoxWidth, gBoxHeight;

let gAllIterations = [];

function setup() {
  let l = windowHeight < windowWidth ? windowHeight : windowWidth;
  createCanvas(l, l);

  gBoxWidth = width / gNumCols;
  gBoxHeight = height / gNumRows;

  if (isDebug) {
    initPanel();
    gOGSettings = settings.map((obj) => deepCopy(obj));
  }

  stroke(0);
  noFill();
  createNewArt();
  noLoop();
}

function draw() {
  background(255);

  for (let iter of gAllIterations) {
    iter.draw();
  }
}

function createNewArt() {
  gAllIterations = [];

  for (let y = gBoxHeight / 2; y < height; y += gBoxHeight) {
    gAllIterations.push(new IterationRow(y));
  }
}

function mouseClicked() {
  createNewArt();
}

class IterationRow {
  constructor(y) {
    this.iterations = [];
    let startVertices = [];
    for (let i = 0; i < TWO_PI; i += PI / 30) {
      let vX = cos(i) * gBoxWidth * 0.3;
      let vY = sin(i) * gBoxHeight * 0.3;
      startVertices.push(createVector(vX, vY));
    }
    for (let x = gBoxWidth / 2; x < width; x += gBoxWidth) {
      let nI = new NthIteration(x, y, startVertices);
      startVertices = nI.vertices;
      this.iterations.push(nI);
    }
  }

  createPath() {
    let path = [];
    let count = 50;
    let inc = (0.8 * gRadius) / (count - 1);
    path.push(createVector(gMin.x + random(0.1, 0.5) * gRadius, gMax.y));
    path.push(createVector(gMin.x, getRandInBoundPos().y));
    for (let i = 1; i < count; i++) {
      if (random() > 0.7) continue;
      let xp = constrain(i * inc + 0.25 * width * random(-1, 1), gMin.x, gMax.x);
      path.push(createVector(xp, getRandInBoundPos().y));
    }
    path.push(createVector(gMax.x, gMin.y));
    return path;
  }

  getRandInBoundPos() {
    return createVector(random(gMin.x, gMax.x), random(gMin.y, gMax.y));
  }

  draw() {
    for (let n of this.iterations) {
      n.draw();
    }
  }
}

class NthIteration {
  constructor(x, y, vs) {
    this.x = x;
    this.y = y;

    this.vertices = this.moveVertices(vs);
  }

  moveVertices(vs) {
    let newVs = [];
    for (let v of vs) {
      let xp = v.x + random(-1, 1) * 10;
      let yp = v.y + random(-1, 1) * 10;
      newVs.push(createVector(xp, yp));
    }
    return newVs;
  }

  draw() {
    push();
    translate(this.x, this.y);
    this.drawShape();
    pop();
  }

  drawShape() {
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}
