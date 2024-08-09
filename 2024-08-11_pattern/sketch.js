// Created for the #WCCChallenge
let gPattern;

// let gPoppyColors = ['#da0500', '#0d0000', '#BC9785'];
let gFlowerColors = [
  ['#d6cbbb', '#b87b6a'],
  ['#b87b6a', '#d6cbbb'],
  ['#bb343a', '#b87b6a'],
  ['#bb343a', '#d6cbbb'],
];

let gTestFlower;

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();
  noLoop();

  createPattern();
}

function draw() {
  background('#2f292f');

  gPattern.draw();
}

function createPattern() {
  const pW = random(0.4, 0.8) * width;
  const pH = random(0.4, 0.8) * height;
  gPattern = new Pattern(pW, pH);
}

function mouseClicked() {
  createPattern();
  redraw();
}

class Pattern {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.count = int(random(10, 20));
    const shortSide = min(w, h);
    this.unitSize = shortSide / sqrt(this.count);

    this.flowers = [];
    this.createFlowers();
  }

  createFlowers() {
    const buffer = 0;
    0.2 * this.unitSize;
    for (let i = 0; i < 3 * this.count; i++) {
      let radius = random(0.3, 0.6) * this.unitSize;
      let flower;
      let overlapping = true;
      let count = 0;
      while (overlapping || count > 100) {
        count++;
        overlapping = false;
        let x = random(buffer, this.w - buffer);
        let y = random(buffer, this.h - buffer);
        flower = { x: x, y: y, r: radius };

        for (let j = 0; j < this.flowers.length; j++) {
          let other = this.flowers[j];
          let d = dist(flower.x, flower.y, other.x, other.y);
          if (d < 0.5 * (flower.r + other.r)) {
            overlapping = true;
            break;
          }
        }
      }
      this.flowers.push(new Poppy(flower.x, flower.y, flower.r));
    }
  }

  draw() {
    let xp = -0.5 * this.w;
    let yp = -0.5 * this.h;
    while (yp < height + this.h) {
      while (xp < width + this.w) {
        push();
        translate(xp, yp);

        // fill(random(255), 100);
        // rect(0, 0, this.w, this.h);
        this.flowers.forEach((flower) => {
          flower.draw();
        });
        pop();
        xp += this.w;
      }
      xp = 0;
      yp += this.h;
    }
  }
}

class Poppy {
  constructor(x, y, rad) {
    this.x = x;
    this.y = y;
    this.r = rad;
    this.flowerLayers = [];

    const radScalars = [1, random(0.2, 0.3), random(0.05, 0.1)];
    let flowerColors = random(gFlowerColors);
    for (let i = 0; i < flowerColors.length; i++) {
      this.flowerLayers.push(new FlowerBase(radScalars[i] * rad, flowerColors[i]));
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
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
    let num = int(random(12, 20));
    let angleInc = TWO_PI / num;
    this.flowerRadius = rad;
    let minRad = random(0.3, 0.8);
    for (let i = 0; i < num; i++) {
      let angle = i * angleInc;
      let r = map(i % 2 === 0 ? 0 : random(0.1, 0.5), 0, 1, minRad * this.flowerRadius, this.flowerRadius);
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
