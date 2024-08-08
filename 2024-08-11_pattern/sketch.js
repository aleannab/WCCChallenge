// Created for the #WCCChallenge
let gPattern = [];

let gPoppyColors = ['#da0500', '#0d0000', '#BC9785'];

let gPoppyPet;

let gTestFlower;

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();
  noLoop();

  createPattern();
}

function draw() {
  background(255);

  gTestFlower.draw();
}

function createPattern() {
  gTestFlower = new Poppy(100);
}

function mouseClicked() {
  createPattern();
  redraw();
}

class Pattern {
  constructor() {
    this.flowers = [];
    createPattern();
  }

  createPattern() {}
}

class Poppy {
  constructor(rad) {
    this.flowerLayers = [];

    const radScalars = [1, random(0.2, 0.3), random(0.05, 0.1)];
    for (let i = 0; i < gPoppyColors.length; i++) {
      this.flowerLayers.push(new FlowerBase(radScalars[i] * rad, gPoppyColors[i]));
    }
  }

  draw() {
    push();
    translate(width / 2, height / 2);
    this.flowerLayers.forEach((flower) => {
      flower.draw();
    });
    pop();
  }
}

class OregonGrape {
  constructor() {}
}

class Bluebonnet {
  constructor() {}
}

class OrangeBlossom {
  constructor() {}
}

class FlowerBase {
  constructor(rad, col) {
    this.flowerPoints = [];
    this.color = col;
    let num = 12;
    let angleInc = TWO_PI / num;
    this.flowerRadius = rad;
    for (let i = 0; i < num; i++) {
      let angle = i * angleInc;
      let r = map(i % 2 === 0 ? 0 : random(0.1, 0.5), 0, 1, this.flowerRadius, this.flowerRadius * 1.5);
      let x = r * cos(angle);
      let y = r * sin(angle);
      this.flowerPoints.push(createVector(x, y));
    }
  }
  draw() {
    fill(this.color);
    beginShape();
    this.flowerPoints.forEach((pt) => {
      curveVertex(pt.x, pt.y);
    });
    endShape(CLOSE);
  }
}
