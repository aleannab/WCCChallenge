// Created for the #WCCChallenge
let gPattern;

let gColorPalette = ['#d6cbbb', '#b87b6a', '#bb343a', '#e3d66b'];

let gFlowerColors = [];
let gBgColor = '#2f292f';

let gFlowerTypes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  strokeWeight(3);
  noLoop();

  // curveTightness();
  createPattern();
}

function draw() {
  background(gBgColor);
  stroke(gBgColor);

  gPattern.draw();
}

function createPattern() {
  createFlowers();
  const pW = random(0.4, 0.8) * width;
  const pH = random(0.4, 0.8) * height;
  gPattern = new Pattern(pW, pH);
}

function createFlowers() {
  const typeOfFlowers = int(random(1, 5));

  gFlowerTypes = [];
  for (let i = 0; i < typeOfFlowers; i++) {
    gColorPalette = shuffle(gColorPalette);
    let palette = [];
    let layerCount = int(random(1, 3));
    for (let j = 0; j < layerCount; j++) {
      palette.push(gColorPalette[j % gColorPalette.length]);
    }
    gFlowerTypes.push(new FlowerType(palette));
  }
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
      let flowerType = random(gFlowerTypes);
      let typeVar = flowerType.getRandomParameters();

      let radius = typeVar.flowerSize * this.unitSize;
      let flower;
      let overlapping = true;
      let count = 0;

      while (overlapping || count < 100) {
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
      this.flowers.push(new Flower(flower.x, flower.y, flower.r, typeVar));
    }
  }

  draw() {
    let xp = -0.5 * this.w;
    let yp = -0.5 * this.h;
    while (yp < height + this.h) {
      while (xp < width + this.w) {
        push();
        translate(xp, yp);
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

class Flower {
  constructor(x, y, rad, type) {
    this.x = x;
    this.y = y;
    this.r = rad;
    this.flowerLayers = [];

    let radScalars = type.layerScalars;
    let flowerColors = type.palette;
    for (let i = 0; i < flowerColors.length; i++) {
      this.flowerLayers.push(new FlowerBase(radScalars[i] * rad, flowerColors[i], type));
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

class FlowerBase {
  constructor(rad, col, type) {
    this.flowerPoints = [];
    this.color = col;
    let num = type.pointCount;
    let angleInc = TWO_PI / num;
    this.flowerRadius = rad;
    let minRad = type.petalDefinition; //random(0.3, 0.8);
    let offset = random(TWO_PI);
    for (let i = 0; i < num; i++) {
      let angle = i * angleInc + offset;
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

class FlowerType {
  constructor(palette) {
    this.palette = palette;
    this.count = this.init(12, 20);
    this.size = this.init(0.3, 0.6);
    this.petalDef = this.init(0.3, 0.9);
    this.layerScalars = [];
    let curScalar = 1;
    for (let i = 0; i < palette.length; i++) {
      this.layerScalars.push(curScalar);
      curScalar *= random(0.1, 0.5);
    }
    console.log(this.palette);
  }

  init(x, y) {
    let m = random(x, y);
    let variance = random(0.02, 0.1);
    return { min: m - variance, max: m + variance };
  }

  getRandomParameters() {
    let count = random(this.count.min, this.count.max);
    // if (count % 2 != 0) count += 1;
    const size = random(this.size.min, this.size.max);
    const petals = random(this.petalDef.min, this.petalDef.max);
    return { pointCount: count, flowerSize: size, petalDefinition: petals, palette: this.palette, layerScalars: this.layerScalars };
  }
}
