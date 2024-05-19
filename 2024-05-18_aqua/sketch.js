//inspo: https://www.irocks.com/minerals/specimen/39044

let gPalette = ['#4F818C', '#8EBABF', '#72A0B0', '#92CAD7', '#BDD1DC'];
let gPaletteLines = [...gPalette, '#4C5E67', '#325259'];

let gBrushBox = ['2H', 'pen', 'rotring'];

function setup() {
  let h = windowHeight < windowWidth ? windowHeight : 1.2 * windowWidth;
  let w = windowHeight < windowWidth ? 0.8 * windowHeight : windowWidth;
  createCanvas(0.9 * w, 0.9 * h, WEBGL);
  noLoop();
  angleMode(DEGREES);
  background(255);
  // for whatever reason I have to set a field before being able to specify no field
  // brush.field('curved');
  brush.noField();
  brush.noStroke();
}

function draw() {
  for (let i = 0; i < 20; i++) {
    brush.fill(random(gPalette), random(60, 100));
    brush.bleed(0.03);
    brush.fillTexture(0.8, 0.5);
    brush.setHatch('pen', random(gPalette));
    brush.hatch(random(5, 10), -90, { rand: 0, continuous: false, gradient: false });
    brush.rect(width * random(-0.2, 0.2), random(-0.2, 0.2) * height, random(0.01, 0.2) * width, random(0.3, 0.6) * height, CENTER);
  }

  for (let i = 0; i < 100; i++) {
    brush.set(random(gBrushBox), random(gPaletteLines), random(1, 10));
    brush.flowLine(width * randomGaussian() * 0.1, random(-0.4) * height, random(0.1, 0.5) * height, -90);
  }
}
