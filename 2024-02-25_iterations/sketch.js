// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gNumRows = 10;
let gNumCols = 10;
let gBoxWidth, gBoxHeight;

let gAllIterations = [];

let gBgColor = '#f4f1ea';
let gBlobPalette = ['#3567af', '#c04e82', '#538e47', '#e88740', '#016d6f', '#e25c43'];

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
  strokeWeight(3);
  noFill();
  createNewArt();
}

function draw() {
  background(gBgColor);

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

    this.min = createVector(gBoxWidth, gBoxHeight).mult(0.3);
    this.max = createVector(gBoxWidth, gBoxHeight).mult(0.7);
    let startElements = [];

    for (let x = 0; x < width - gBoxWidth; x += gBoxWidth) {
      let nI = new NthIteration(x, y, startElements, this.min, this.max);
      startElements = nI.elements.map((element) => ({ ...element }));
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
    this.elements = elements;

    // if (random() < 0.5 || elements.length < 1) {
    this.elements.push(this.createElement());
    this.sortElements();
    // }
    this.moveRandomElement();
  }

  createElement() {
    let newElement = {
      color: random(gBlobPalette),
    };
    if (random() < 0.5) {
      newElement.type = 'line';
      newElement.data = this.createPath();
      newElement.size = random(2, 5);
    } else {
      newElement.type = 'circle';
      newElement.data = this.getRandInBoundPos();
      newElement.size = random(this.min.x, this.max.x) * 0.5;
      console.log(newElement.size);
    }

    return newElement;
  }

  sortElements() {
    this.elements.sort((a, b) => {
      const typeOrder = { circle: 0, square: 1, line: 2 };
      const typeA = typeOrder[a.type];
      const typeB = typeOrder[b.type];

      return typeA - typeB;
    });
  }

  moveRandomElement() {
    for (let i = 0; i < this.elements.length; i++) {
      let eleType = this.elements[i].type;
      let updatedData;
      if (eleType === 'line') {
        updatedData = this.moveVertices(this.elements[i].data);
      } else if (eleType === 'circle') {
        updatedData = this.getRandInBoundPos();
        this.elements[i].size = random(this.min.x, this.max.x) * 0.5;
      }
      this.elements[i].color = random(gBlobPalette);
      this.elements[i].data = updatedData;
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
    if (e.type === 'line') {
      this.drawLine(e);
    } else if (e.type === 'circle') {
      this.drawCircle(e);
    }
  }

  drawLine(e) {
    strokeWeight(e.size);
    stroke(e.color);
    noFill();
    beginShape();
    for (let v of e.data) {
      curveVertex(v.x, v.y);
    }
    endShape();
  }

  drawCircle(e) {
    fill(e.color);
    noStroke();
    ellipse(e.data.x, e.data.y, e.size);
  }
}
