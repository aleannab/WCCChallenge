// Created for the #WCCChallenge
let isDebug = true;
let gOGSettings;

let gRowCount, gColCount;
let gBoxWidth, gBoxHeight;

let gAllIterationRows = [];

let gBgColor = '#f4f1ea';
let gBlobPalette = ['#3567af', '#c04e82', '#538e47', '#e88740', '#016d6f', '#e25c43'];

function setup() {
  let h = windowHeight < windowWidth ? windowHeight : 1.2 * windowWidth;
  let w = windowHeight < windowWidth ? 0.8 * windowHeight : windowWidth;
  createCanvas(w, h);
  rectMode(CORNERS);
  noStroke();

  if (isDebug) {
    initPanel();
    gOGSettings = settings.map((obj) => deepCopy(obj));
  }

  createNewArt();
}

function draw() {
  background(gBgColor);

  for (let iter of gAllIterationRows) {
    iter.draw();
  }
}

function createNewArt() {
  gRowCount = getValue('gRowCount') + 2; // add margins
  gColCount = getValue('gColCount') + 2;

  gBoxWidth = width / gColCount;
  gBoxHeight = height / gRowCount;
  gAllIterationRows = [];

  for (let i = 1; i < gRowCount - 1; i++) {
    let y = i * gBoxHeight;
    gAllIterationRows.push(new IterationRow(y));
  }
}

function mouseClicked() {
  createNewArt();
}

class IterationRow {
  constructor(y) {
    this.iterations = [];

    // TODO: put in settings
    this.min = createVector(gBoxWidth, gBoxHeight).mult(0.1);
    this.max = createVector(gBoxWidth, gBoxHeight).mult(0.9);

    let startElements = [];
    for (let i = 1; i < gColCount - 1; i++) {
      let nI = new NthIteration(i * gBoxWidth, y, startElements, this.min, this.max);
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

    if ((elements.length < 3 && random() < 0.5) || elements.length < 1) {
      this.createElement();
    } else {
      this.changeRandomElement();
    }
  }

  createElement() {
    let newElement = {
      colorIndex: floor(random(gBlobPalette.length)),
      data: this.createPath(),
    };

    this.elements.push(newElement);
  }

  changeRandomElement() {
    let i = floor(random(this.elements.length));
    let randVal = random();
    if (randVal < 0.33 && this.elements.length != 1) {
      // shuffle render order
      this.elements = shuffle(this.elements);
    } else if (randVal < 0.66) {
      // modify path
      this.elements[i].data = this.moveVertices(this.elements[i].data);
    } else {
      // change color
      this.elements[i].colorIndex = (this.elements[i].colorIndex + floor(random(1, 2))) % gBlobPalette.length;
    }
  }

  createPath() {
    let path = [];
    let count = getValue('gVerticesCount');
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
    fill(gBlobPalette[e.colorIndex]);
    beginShape();
    for (let v of e.data) {
      curveVertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}
