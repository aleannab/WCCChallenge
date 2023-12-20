// Created for the #WCCChallenge - Arc

let gAllArcs = [];
let gLineInc;

let gColorPalette = ['#c9e4ca', '#87bba2', '#55828b', '#3b6064', '#364958']; //['#4236C7', '#D9D9D9', '#C7369F'];
let gLastMoveTime = 0;
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(30);
  smooth();

  let lineCount = 15;

  gLineInc = (0.4 * height) / (lineCount - 1);

  let offset = gLineInc;
  let same = 0;
  let isCircle = true;
  for (let i = 0; i < lineCount; i++) {
    // if (isCircle && same < 2) {
    //   same += 1;
    // } else {
    isCircle = !isCircle;
    //}
    let arc = new Arc(isCircle, offset);
    gAllArcs.push(arc);
    offset += gLineInc; //arc.size;
  }
}

function mouseClicked() {}

function draw() {
  background(255);

  fill(0);
  renderSmoothCircle(0, 0, 50);
  for (let archie of gAllArcs) {
    archie.draw();
  }
}

function renderSmoothCircle(x, y, diameter) {
  let numVertices = 50;
  noStroke();
  beginShape();
  for (let i = 0; i < numVertices; i++) {
    let angle = map(i, 0, numVertices, 0, TWO_PI);
    let xPos = x + (cos(angle) * diameter) / 2;
    let yPos = y + (sin(angle) * diameter) / 2;
    vertex(xPos, yPos);
  }
  endShape(CLOSE);
}

class Arc {
  constructor(isCircle, offset) {
    // init positions
    this.startAngle = this.getRandomQuartAngle(3);
    this.endAngle = this.startAngle + this.getRandomQuartAngle(2);
    this.offset = offset;

    this.isCircle = isCircle;
    this.isDescending = this.getRandBool();

    let diff = this.endAngle - this.startAngle;
    let arcLength = (diff * 2 * this.offset) / PI;

    if (this.isCircle) {
      let min = 0.2 * gLineInc;
      let max = 0.8 * gLineInc;
      this.size = random(min, max);
      let maxScalar = map(this.size, min, max, 1.1, 4);
      this.count = floor(arcLength / (this.size * random(1.1, maxScalar)));
      this.sizeInc = (0.8 * this.size) / (this.count - 1);
    } else {
      this.weight = random(0.5, 3);
      let scalar = map(this.weight, 0.5, 3, 2, 0.5);
      this.size = random(0.5 * gLineInc, scalar * gLineInc);
      this.count = floor(arcLength / (this.weight * random(3, 10)));
      this.weightInc = (0.8 * this.weight) / (this.count - 1);
      this.sizeInc = diff / (this.count - 1);
    }

    this.spacing = diff / (this.count - 1);
  }

  draw() {
    stroke(0);
    fill(0);

    //translate(0, this.shift);
    let curSize = this.size;
    let weight = this.weight;
    for (let i = 0; i < this.count; i++) {
      push();
      rotateZ(this.startAngle + this.spacing * i);
      translate(0, this.offset);
      if (this.isCircle) renderSmoothCircle(0, 0, curSize);
      else {
        strokeWeight(weight);
        line(0, 0, 0, curSize);
        weight -= this.weightInc;
      }
      pop();
      curSize -= this.sizeInc;
    }
  }

  getRandBool() {
    return random(0, 1) < 0.5;
  }

  getRandomQuartAngle(amount) {
    let scalar = floor(random(1, amount));
    return scalar * PI;
  }
}
