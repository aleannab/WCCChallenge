// Created for the #WCCChallenge - Arc

let gAllCircles = [];

let gLineCount;
let gLineInc;
let gCircleRad;

let gIsVertical;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  gIsVertical = windowHeight > windowWidth;

  gCircleRad = (gIsVertical ? windowWidth : windowHeight) * 0.8;

  createCircles();
}

function createCircles() {
  gLineCount = random(8, 10);
  gAllCircles = [];
  let inc = 0.8 * gCircleRad;
  let posOffset = -0.5 * inc;
  for (let i = 0; i < 2; i++) {
    gAllCircles.push(new Circle(posOffset));
    posOffset += inc;
  }
}

function mouseClicked() {
  createCircles();
}

function draw() {
  background('#f6f6f6');

  for (let circe of gAllCircles) {
    circe.draw();
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

class Circle {
  constructor(circleOffset) {
    const xp = gIsVertical ? 0 : circleOffset;
    const yp = gIsVertical ? circleOffset : 0;
    this.circleOffset = createVector(xp, yp);
    this.allArcs = [];

    gLineInc = (0.4 * gCircleRad) / (gLineCount - 1);

    let offset = gLineInc;
    let isCircle = true;
    for (let i = 0; i < gLineCount; i++) {
      isCircle = !isCircle;
      let arc = new Arc(isCircle, offset);
      this.allArcs.push(arc);
      offset += gLineInc;
    }
  }

  draw() {
    push();
    translate(this.circleOffset.x, this.circleOffset.y);
    for (let archie of this.allArcs) {
      archie.draw();
    }
    pop();
  }
}

class Arc {
  constructor(isCircle, offset) {
    // init positions
    this.startAngle = floor(random(1, 3)) * PI;
    if (gIsVertical) this.startAngle += HALF_PI;
    this.endAngle = this.startAngle + PI;
    this.offset = offset;

    this.isCircle = isCircle;

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
      this.count = floor(arcLength / (this.weight * random(4, 10)));
      this.weightInc = (0.8 * this.weight) / (this.count - 1);
      this.sizeInc = diff / (this.count - 1);
    }

    this.spacing = diff / (this.count - 1);
  }

  draw() {
    stroke(0);
    fill(0);

    let curSize = this.size;
    let weight = this.weight;
    for (let i = 0; i < this.count; i++) {
      push();
      rotateZ(HALF_PI + this.startAngle + this.spacing * i);
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
}
