let gImageOG;
let gImageRef;
let gScale;
let gTree = [];
let gPoints = [];

function preload() {
  gImageOG = loadImage('test02.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let density = 20;
  gImageRef = gImageOG.get(0, 0, gImageOG.width, gImageOG.height);
  gImageRef.resize(0, density);
  gImageRef.filter(THRESHOLD);

  gScale = windowWidth < windowHeight ? windowWidth / gImageOG.width : windowHeight / gImageOG.height;
  let offsetX = 0; //(windowWidth - gImageOG.width * gScale) / 2;
  let offsetY = 0;
  (windowHeight - gImageRef.height * gScale) / 2;

  let sectionWidth = width / density;
  let yCount = floor(height / sectionWidth);
  let sectionHeight = height / yCount;
  gImageRef.loadPixels();
  for (let y = 0; y < gImageRef.height; y++) {
    for (let x = 0; x < gImageRef.width; x++) {
      let index = (x + y * gImageRef.width) * 4;
      if (gImageRef.pixels[index] === 0) {
        gPoints.push(createVector(sectionWidth * x + offsetX, sectionHeight * y + offsetY));
      }
    }
  }
  console.log('gPoints count: ' + gPoints.length);

  gTree = createNodes(0, 0, width, height, density);
  noLoop();
}

function draw() {
  background(255);

  fill(0);
  gPoints.forEach((pt) => {
    ellipse(pt.x, pt.y, 50);
  });

  fill(255);

  gTree.draw();
}

function createNodes(x, y, w, h, density) {
  let currentQuadrant = new Quadrant(x, y);
  if (density > 20) return currentQuadrant;

  // get relevant part of image and resize accordingly
  let image = gImageOG.get(x, y, gImageOG.width, gImageOG.height);
  image.resize(0, density);
  image.filter(THRESHOLD);

  image.loadPixels();
  let sectionWidth = width / density;
  let yCount = floor(height / sectionWidth);
  let sectionHeight = height / yCount;

  currentQuadrant.points = [];
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      let index = (x + y * image.width) * 4;
      if (image.pixels[index] === 0) {
        currentQuadrant.points.push(createVector(sectionWidth * x, sectionHeight * y));
      }
    }
  }

  console.log('tree count: ' + currentQuadrant.points.length);

  let halfW = floor(w / 2);
  let halfH = floor(h / 2);
  // console.log('half size: ' + halfW + ' ' + halfH);
  let newDensity = 2 * density;
  currentQuadrant.quadrants.push(createNodes(x, y, halfW, halfH, newDensity)); // Top-left
  currentQuadrant.quadrants.push(createNodes(x + halfW, y, halfW, halfH, newDensity)); // Top-right
  currentQuadrant.quadrants.push(createNodes(x, y + halfH, halfW, halfH, newDensity)); // Bottom-left
  currentQuadrant.quadrants.push(createNodes(x + halfW, y + halfH, halfW, halfH, newDensity)); // Bottom-right

  return currentQuadrant;
}

class Quadrant {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.points = [];
    this.quadrants = [];
  }

  draw() {
    fill(255, 0, 0);
    push();
    translate(this.x, this.y);
    this.points.forEach((pt) => {
      ellipse(pt.x, pt.y, 5);
    });
    this.quadrants.forEach((q) => {
      // q.draw();
    });
    // this.quadrants[0].draw();
    pop();
  }
}
