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

  for (let y = 0; y < height; y += gBoxHeight) {
    gAllIterations.push(new IterationRow(y));
  }
}

function mouseClicked() {
  createNewArt();
}

class IterationRow {
  constructor(y) {
    this.iterations = [];

    this.min = createVector(gBoxWidth, gBoxHeight).mult(0.2);
    this.max = createVector(gBoxWidth, gBoxHeight).mult(0.8);
    let startElements = [];

    for (let x = 0; x < width - gBoxWidth; x += gBoxWidth) {
      let startElementsCopy = startElements.slice();
      let nI = new NthIteration(x, y, startElementsCopy, this.min, this.max);
      startElements = nI.elements;
      this.iterations.push(nI);
    }
  }

  draw() {
    for (let n of this.iterations) {
      n.draw();
    }
  }
}

class NthIteration {
  constructor(x, y, elements, min, max) {
    this.x = x;
    this.y = y;
    this.min = min;
    this.max = max;
    this.elements = [];

    if (elements.length < 1) {
      this.elements.push(this.createPath());
    } else {
      this.elements = elements;
      let randIndex = floor(random(this.elements.length));
      this.elements[randIndex] = this.moveVertices(this.elements[randIndex]);
    }
  }

  createPath() {
    let path = [];
    let count = 8;
    let inc = (0.8 * gBoxWidth) / (count - 1);
    path.push(createVector(this.min.x + random(0.1, 0.5) * gBoxWidth, gBoxHeight));
    path.push(createVector(this.min.x, this.getRandInBoundPos().y));
    for (let i = 1; i < count; i++) {
      if (random() > 0.7) continue;
      let xp = constrain(i * inc + 0.1 * gBoxWidth * random(-1, 1), this.min.x, this.max.x);
      path.push(createVector(xp, this.getRandInBoundPos().y));
    }
    path.push(createVector(this.max.x, this.min.y));
    return path;
  }

  getRandInBoundPos() {
    return createVector(random(this.min.x, this.max.x), random(this.min.y, this.max.y));
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
    for (let e of this.elements) {
      this.drawShape(e);
    }
    pop();
  }

  drawShape(e) {
    beginShape();
    for (let v of e) {
      curveVertex(v.x, v.y);
    }
    endShape();
  }
}
