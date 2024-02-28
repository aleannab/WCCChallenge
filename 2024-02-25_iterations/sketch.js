// I Could Go On by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Iterations
//
// My initial idea was to have a sequence of shapes where each shape would iterate on the previous by modifying it in some way.
//
// Looking for inspiration I came across an image of Erich Dieckmann's Design Development of a Metal Tube Chair.
// I decided to display my iteration progression similarly, with rows of different iterations:
// small changes accumulating from left to right.
//
// Essentially each iteration row does the following
// - Create Starting Form
// - Modify by one of the following
//			* Add a shape
// 			* Change the colors
//			* Move the vertices of the shape(s)
//			* Shuffle the order shapes are drawn
// - Repeat: Use End Result as Starting Form for next iteration
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let isDebug = false;
let gOGSettings;

let gRowCount, gColCount;
let gBoxWidth, gBoxHeight;
let gVerticesCount;

let gAllIterationRows = [];

let gBgColor = '#f4f1ea';
let gBlobPalette = ['#3567af', '#c04e82', '#538e47', '#e88740', '#016d6f', '#e25c43'];

function setup() {
  let h = windowHeight < windowWidth ? windowHeight : 1.2 * windowWidth;
  let w = windowHeight < windowWidth ? 0.8 * windowHeight : windowWidth;
  createCanvas(0.9 * w, 0.9 * h);
  rectMode(CORNERS);
  strokeWeight(2);

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
  gVerticesCount = getValue('gVerticesCount');

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
    this.justShuffled = false;

    if ((elements.length < 3 && random() < 0.5) || elements.length < 1) {
      this.createElement();
    } else {
      this.changeRandomElement();
    }
  }

  createElement() {
    let largestIndex = -1;
    for (let ele of this.elements) {
      if (ele.colorIndex > largestIndex) largestIndex = ele.colorIndex;
    }
    if (largestIndex < 0) largestIndex = floor(random(gBlobPalette.length));
    this.curColIndex = floor(largestIndex + 1) % gBlobPalette.length;
    let newElement = {
      colorIndex: this.curColIndex,
      data: this.createPath(),
    };

    this.elements.push(newElement);
  }

  changeRandomElement() {
    let randVal = random();
    if (this.elements.length === 1 || !this.justShuffled || randVal > 0.8) {
      if (random() > 0.5) {
        for (let ele of this.elements) {
          ele.colorIndex = (ele.colorIndex + 1) % gBlobPalette.length;
        }
      } else {
        for (let ele of this.elements) {
          ele.data = this.moveVertices(ele.data);
        }
      }
      this.justShuffled = false;
    } else {
      this.shuffleElements();
      this.justShuffled = true;
    }
  }

  shuffleElements() {
    let firstItem = this.elements.shift();
    if (this.elements.length > 1 && random() < 0.5) this.elements.reverse();
    this.elements.push(firstItem);
  }

  createPath() {
    let path = [];

    let inc = (0.8 * gBoxWidth) / (gVerticesCount - 1);
    path.push(this.getRandInBoundPos());
    path.push(createVector(this.min.x, this.getRandInBoundPos().y));
    for (let i = 1; i < gVerticesCount; i++) {
      let xp = constrain(i * inc + 0.1 * gBoxWidth * random(-1, 1), this.min.x, this.max.x);
      path.push(this.getRandInBoundPos());
    }
    path.push(createVector(this.max.x, this.getRandInBoundPos().y));
    path.push(this.getRandInBoundPos());
    return path;
  }

  getRandInBoundPos() {
    return createVector(random(this.min.x, this.max.x), random(this.min.y, this.max.y));
  }

  moveVertices(vs) {
    let newVs = [];
    for (let v of vs) {
      let xp = v.x + random(-0.15, 0.15) * gBoxWidth;
      let yp = v.y + random(-0.15, 0.15) * gBoxHeight;
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
    noFill();
    fill(gBlobPalette[e.colorIndex]);
    strokeWeight(2);
    stroke(gBlobPalette[e.colorIndex]);
    beginShape();
    for (let v of e.data) {
      curveVertex(v.x, v.y);
    }
    endShape();
  }
}
