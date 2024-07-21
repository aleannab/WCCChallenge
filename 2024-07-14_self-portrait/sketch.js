let gImageOG;
let gImageRef;
let gDotLayers = [];
let gDensityMin = 0.01;
let gDensityMax = 0.1;
let gPadding = 0.05;
let gBounds;
let gPositionOffset;

let gColorPalette = ['#c14d8d', '#b54a7f', '#a24a6a', '#703a4b', '#2f0e27', '#3a1329', '#200c1f'];
let gColorDark = '#1E1E29';
let gColorLight = '#E7E1CD';

function preload() {
  gImageOG = loadImage('portrait.jpg');
}

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (3 * windowHeight) / 4;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.95 * w, 0.95 * h);

  let length = isPortrait ? windowWidth : windowHeight;

  gDensityMax *= length;
  gDensityMin *= length;
  gPadding *= length;

  setupDotLayers();
  noLoop();
}

function draw() {
  background(255);
  push();
  translate(gPositionOffset.x, gPositionOffset.y);
  gDotLayers.forEach((layer) => {
    layer.draw();
  });
  pop();
}

function mouseClicked() {
  setupDotLayers();
}

function setupDotLayers() {
  gColorPalette = shuffle(gColorPalette);

  gDotLayers = [];
  gBounds = { xMin: 999, xMax: 0, yMin: 999, yMax: 0 };

  let densities = [];
  let count = 3;
  for (let i = 0; i < count; i++) {
    densities.push(int(random(gDensityMin, gDensityMax)));
  }
  densities = sort(densities);

  for (let i = 0; i < densities.length - 1; i++) {
    gDotLayers.push(new DotLayer(densities[i], gColorPalette[i % gColorPalette.length]));
  }
  gDotLayers.push(new DotLayer(densities[densities.length - 1], gColorDark));

  let xp = (width - (gBounds.xMax - gBounds.xMin)) / 2 - gBounds.xMin;
  let yp = (height - (gBounds.yMax - gBounds.yMin)) / 2 - gBounds.yMin;
  gPositionOffset = createVector(xp, yp);

  redraw();
}

function checkBounds(xp, yp) {
  gBounds.xMin = min(gBounds.xMin, xp);
  gBounds.xMax = max(gBounds.xMax, xp);
  gBounds.yMin = min(gBounds.yMin, yp);
  gBounds.yMax = max(gBounds.yMax, yp);
}

class DotLayer {
  constructor(density, dotColor) {
    let image = gImageOG.get(0, 0, gImageOG.width, gImageOG.height);
    image.resize(0, density);
    image.filter(THRESHOLD, 0.8);

    let sectionWidth = (width - 2 * gPadding) / density;

    this.size = map(density, gDensityMax, gDensityMin, 0.6, 0.9) * sectionWidth;

    let yCount = floor((height - 2 * gPadding) / sectionWidth);
    let sectionHeight = (height - 2 * gPadding) / yCount;
    image.loadPixels();

    this.points = [];
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        let index = (x + y * image.width) * 4;
        if (image.pixels[index] === 0) {
          let xp = sectionWidth * x;
          let yp = sectionHeight * y;
          checkBounds(xp - this.size, yp - this.size);
          checkBounds(xp + this.size, yp + this.size);

          this.points.push(createVector(xp, yp));
        }
      }
    }

    this.color = dotColor;
    this.offset = createVector(random(-1, 1) * sectionWidth, random(-2, 2) * sectionWidth);
  }

  draw() {
    push();
    translate(this.offset.x, this.offset.y);
    stroke(this.color);

    beginShape();
    let isEllipse = random() < 0.5;
    this.points.forEach((pt) => {
      if (isEllipse) {
        fill(this.color);
        noStroke();
        circle(pt.x, pt.y, this.size);
      } else {
        strokeWeight(this.size * 0.5);
        line(pt.x - this.size, pt.y, pt.x + this.size, pt.y);
      }
    });
    endShape();
    pop();
  }
}
