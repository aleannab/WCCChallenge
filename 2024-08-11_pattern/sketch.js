// Marimekko by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Pattern
//
// I found inspiration in the Marimekko's textile patterns.
// They often feature big, eye-catching shapes with a mix of simplicity and playfulness.
//
// I'd love to expand this to add more nature-inspired shapes and organic lines.
//
// https://www.marimekko.com/com_en/maripedia/patterns/
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2blet gPattern;

let gColorPalette = ['#d6cbbb', '#b87b6a', '#bb343a', '#e3d66b', '#708087'];

let gBgColor = '#2f292f';

let gShapeTypes = [];

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
  createShapes();
  const pW = random(0.2, 0.6) * width;
  const pH = random(0.2, 0.6) * height;
  gPattern = new Pattern(pW, pH);
}

function createShapes() {
  const shapeCount = int(random(1, 4));

  gShapeTypes = [];
  for (let i = 0; i < shapeCount; i++) {
    gColorPalette = shuffle(gColorPalette);
    let colorChoices = gColorPalette.slice(0, 3);
    let palette = [];
    let layerCount = int(random(1, 3));
    for (let j = 0; j < layerCount; j++) {
      palette.push(colorChoices[j % colorChoices.length]);
    }
    gShapeTypes.push(new ShapeType(palette));
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
    this.count = int(random(30, 60));
    const shortSide = min(w, h);
    this.unitSize = shortSide / sqrt(0.3 * this.count);

    this.shapes = [];
    this.createShapes();
  }

  createShapes() {
    const buffer = 0.2 * this.unitSize;

    for (let i = 0; i < this.count; i++) {
      let shapeType = random(gShapeTypes);
      let typeVar = shapeType.getRandomParameters();

      let radius = typeVar.shapeSize * this.unitSize;
      let shape;
      let tooMuchOverlap = true;
      let count = 0;

      while (tooMuchOverlap && count < 100) {
        count++;
        tooMuchOverlap = false;
        let x = random(buffer, this.w - buffer);
        let y = random(buffer, this.h - buffer);
        shape = { x: x, y: y, r: radius };

        for (let j = 0; j < this.shapes.length; j++) {
          let other = this.shapes[j];
          let d = dist(shape.x, shape.y, other.x, other.y);
          if (d < 0.5 * (shape.r + other.r)) {
            tooMuchOverlap = true;
            break;
          }
        }
      }
      this.shapes.push(new Shape(shape.x, shape.y, shape.r, typeVar));
    }
  }

  draw() {
    let xp = -0.5 * this.w;
    let yp = -0.5 * this.h;
    while (yp < height + this.h) {
      while (xp < width + this.w) {
        push();
        translate(xp, yp);
        this.shapes.forEach((shape) => {
          shape.draw();
        });
        pop();
        xp += this.w;
      }
      xp = 0;
      yp += this.h;
    }
  }
}

class Shape {
  constructor(x, y, rad, type) {
    this.x = x;
    this.y = y;
    this.r = rad;
    this.shapeLayers = [];

    let shapeColors = type.palette;
    for (let i = 0; i < shapeColors.length; i++) {
      this.shapeLayers.push(new ShapeBase(type.layerData[i].scalar * rad, shapeColors[i], type.layerData[i].count, type.layerData[i].petalDef));
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    this.shapeLayers.forEach((shape) => {
      shape.draw();
    });
    pop();
  }
}

class ShapeBase {
  constructor(rad, col, count, petalDef) {
    this.shapePoints = [];
    this.color = col;
    let num = random(count.min, count.max);
    let angleInc = TWO_PI / num;
    this.shapeRadius = rad;
    let minRad = random(petalDef.min, petalDef.max); //random(0.3, 0.8);
    let offset = random(TWO_PI);
    for (let i = 0; i < num - 1; i++) {
      let angle = i * angleInc + offset;
      let r = map(i % 2 === 0 ? 0 : random(0.1, 0.5), 0, 1, minRad * this.shapeRadius, this.shapeRadius);
      let x = r * cos(angle);
      let y = r * sin(angle);
      this.shapePoints.push(createVector(x, y));
    }
  }
  draw() {
    fill(this.color);
    beginShape();
    this.shapePoints.forEach((pt) => {
      curveVertex(pt.x, pt.y);
    });
    endShape(CLOSE);
  }
}

class ShapeType {
  constructor(palette) {
    this.palette = palette;
    this.size = this.init(0.4, 0.6);
    this.layerData = [];
    this.layerScalars = [];
    let curScalar = 1;
    let def = random(0.5, 0.9);
    for (let i = 0; i < palette.length; i++) {
      this.layerData.push({ scalar: curScalar, count: this.init(6, 12), petalDef: this.initVar(def) });
      curScalar *= random(0.3, 0.5);
    }
  }

  initVar(m) {
    let v = random(0.01, 0.03);
    return { min: m * (1 - v), max: m * (1 + v) };
  }

  init(x, y) {
    let m = random(x, y);
    let v = random(0.01, 0.05);
    return { min: m * (1 - v), max: m * (1 + v) };
  }

  getRandomParameters() {
    const size = random(this.size.min, this.size.max);
    return { shapeSize: size, palette: this.palette, layerData: this.layerData };
  }
}
