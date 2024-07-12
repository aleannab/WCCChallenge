let gImage;

let gScale;

let gPoints = [];

function preload() {
  gImage = loadImage('test02.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  gImage.resize(0, 100);
  gImage.filter(THRESHOLD);

  gScale = windowWidth < windowHeight ? windowWidth / gImage.width : windowHeight / gImage.height;
  let offsetX = (windowWidth - gImage.width * gScale) / 2;
  let offsetY = (windowHeight - gImage.height * gScale) / 2;

  gImage.loadPixels();
  for (let y = 0; y < gImage.height; y++) {
    for (let x = 0; x < gImage.width; x++) {
      let index = (x + y * gImage.width) * 4;
      let isBlack = true;
      for (let j = 0; j < 4; j++) {
        if (gImage.pixels[index] != 0) {
          isBlack = false;
          break;
        }
      }
      if (isBlack) {
        gPoints.push(createVector(gScale * x + offsetX, gScale * y + offsetY));
      }
    }
  }
}

function draw() {
  background(255);

  fill(0);
  gPoints.forEach((pt) => {
    ellipse(pt.x, pt.y, gScale / 10);
  });
}
