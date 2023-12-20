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
  for (let i = 0; i < lineCount; i++) {
    gAllArcs.push(new Arc(offset));
    offset += gLineInc;
  }
}

function mouseClicked() {}

function draw() {
  background(255);

  fill(0);
  renderSmoothCircle(0, 0, 100);
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
  constructor(offset) {
    // init positions
    this.startAngle = this.getRandomQuartAngle(3);
    this.endAngle = this.startAngle + this.getRandomQuartAngle(2);
    this.offset = offset;

    this.isCircle = this.getRandBool();
    this.isDescending = this.getRandBool();

    let diff = this.endAngle - this.startAngle;
    this.size = this.isCircle ? random(5, gLineInc) : random(1, 10);

    strokeWeight(floor(random(0.5, 0.5 * this.size)));
    let arcLength = (diff * 2 * this.offset) / PI;

    this.count = floor(arcLength / (this.size * random(1.5, 2)));
    this.sizeInc = diff / (this.count - 1);

    this.length = random(this.size, 4 * this.size);

    this.shift = random(-100, 100);
  }

  draw() {
    stroke(0);
    fill(0);

    //translate(0, 50);

    // rectangle
    let curSize = this.size;
    for (let i = 0; i < this.count; i++) {
      push();
      rotateZ(this.startAngle + this.sizeInc * i);
      translate(0, this.offset);
      if (this.isCircle) renderSmoothCircle(0, 0, curSize);
      else {
        strokeWeight(curSize);
        stroke(0);
        line(0, 0, 0, 30); //this.length);
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
