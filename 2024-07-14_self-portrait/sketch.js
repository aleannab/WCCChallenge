let gImageOG;
let gImageRef;
let gDotLayers = [];
let gDensityMin = 0.01;
let gDensityMax = 0.1;
let padding = 0.1;

let gColorPalette = ['#d94e41', '#d9863d', '#f2b950', '#95bf93', '#46788c', '#556484'];

function preload() {
  gImageOG = loadImage('test02.png');
}

function setup() {
  let length = min(windowWidth, windowHeight);
  createCanvas(length, length);

  gDensityMax *= length;
  gDensityMin *= length;
  padding *= length;

  setupDotLayers();
  noLoop();
}

function draw() {
  background(255);
  translate(padding, padding);

  fill(0);
  gDotLayers.forEach((layer) => {
    layer.draw();
  });
}

function mouseClicked() {
  setupDotLayers();
}

function setupDotLayers() {
  gColorPalette = shuffle(gColorPalette);

  gDotLayers = [];
  let densities = [];
  for (let i = 0; i < gColorPalette.length; i++) {
    densities.push(int(random(gDensityMin, gDensityMax)));
  }
  console.log(densities);

  densities = sort(densities);
  for (let i = 0; i < densities.length; i++) {
    gDotLayers.push(new DotLayer(densities[i], gColorPalette[i % gColorPalette.length]));
  }

  redraw();
}

class DotLayer {
  constructor(density, dotColor) {
    let image = gImageOG.get(0, 0, gImageOG.width, gImageOG.height);
    image.resize(0, density);
    image.filter(THRESHOLD);

    let sectionWidth = (width - 2 * padding) / density;
    let yCount = floor((height - 2 * padding) / sectionWidth);
    let sectionHeight = (height - 2 * padding) / yCount;
    image.loadPixels();
    this.points = [];
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        let index = (x + y * image.width) * 4;
        if (image.pixels[index] === 0) {
          this.points.push(createVector(sectionWidth * x, sectionHeight * y));
        }
      }
    }
    this.size = map(density, gDensityMax, gDensityMin, 0.3, 0.9) * sectionWidth;

    this.color = dotColor;
  }

  draw() {
    fill(this.color);
    stroke(this.color);

    this.points.forEach((pt) => {
      ellipse(pt.x, pt.y, this.size);
    });
  }
}
