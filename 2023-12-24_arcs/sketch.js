// Created for the #WCCChallenge - Arc

let gAllArcs = [];

let gColorPalette = ['#c9e4ca', '#87bba2', '#55828b', '#3b6064', '#364958']; //['#4236C7', '#D9D9D9', '#C7369F'];
let gLastMoveTime = 0;
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(30);
  smooth();

  let lineCount = 10;

  let lineInc = (0.5 * height) / lineCount;

  let offset = lineInc;
  for (let i = 0; i < 10; i++) {
    gAllArcs.push(new Arc(offset));
    offset += lineInc;
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
  let numVertices = 100;
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
    this.startAngle = this.getRandomAngle();
    this.endAngle = this.startAngle + this.getRandomAngle(0);
    this.offset = offset;

    this.count = random(10, 20); //random(5, 10);
    this.inc = (this.endAngle - this.startAngle) / (this.count - 1);

    this.isCircle = this.getRandBool();
    this.isDescending = this.getRandBool();

    this.size = random(10, 30);
    this.weight = random(3, 10);
    this.sizeInc = this.size / this.count;

    this.shift = random(-100, 100);
  }

  draw() {
    stroke(0);
    strokeWeight(this.weight);
    fill(0);

    //translate(0, 50);

    // rectangle
    let startSize = this.size;
    for (let i = 0; i < this.count; i++) {
      push();
      rotateZ(this.startAngle + this.inc * i);
      translate(0, this.offset);
      if (this.isCircle) renderSmoothCircle(0, 0, this.size);
      else line(0, 0, 0, startSize);
      pop();
      startSize -= this.sizeInc;
    }
  }

  getRandBool() {
    return random(0, 1) < 0.5;
  }

  getRandomAngle(amount) {
    return floor(random(0, TWO_PI));
  }
}
