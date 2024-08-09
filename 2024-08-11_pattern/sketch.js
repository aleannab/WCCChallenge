// Created for the #WCCChallenge
let gPattern;

let gPoppyColors = ['#da0500', '#0d0000', '#BC9785'];

let gTestFlower;

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();
  noLoop();

  createPattern();
}

function draw() {
  background(255);

  gPattern.draw();
}

function createPattern() {
  const pW = random(0.2, 0.6) * width;
  const pH = random(0.2, 0.6) * height;
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
    for (let i = 0; i < this.count; i++) {
      let radius = random(0.1, 0.4) * this.unitSize;
      let flower;
      let overlapping = true;
      while (overlapping) {
        overlapping = false;
        let x = random(buffer, this.w - buffer);
        let y = random(buffer, this.h - buffer);
        flower = { x: x, y: y, r: radius };

        for (let j = 0; j < this.flowers.length; j++) {
          let other = this.flowers[j];
          let d = dist(flower.x, flower.y, other.x, other.y);
          if (d < flower.r + other.r) {
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
    for (let i = 0; i < gPoppyColors.length; i++) {
      this.flowerLayers.push(new FlowerBase(radScalars[i] * rad, gPoppyColors[i]));
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
