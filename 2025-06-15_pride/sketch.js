// Created for the #WCCChallenge

const gFlagDetails = [
  { palette: ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'], name: 'PRIDE' },
  { palette: ['#5BCEFA', '#F7A8B8', '#FFFFFF', '#F7A8B8', '#5BCEFA'], name: 'TRANS' },
  { palette: ['#D60270', '#D60270', '#9B4F96', '#0033A0', '#0033A0'], name: 'BISEXUAL' },
  { palette: ['#D62900', '#FF9B55', '#FFD780', '#FFFFFF', '#D461A6', '#BC3784', '#A60061'], name: 'LESBIAN' },
  { palette: ['#FFF433', '#FFFFFF', '#9B59D0', '#000000'], name: 'NONBINARY' },
  { palette: ['#078D70', '#26CEAA', '#99E8C2', '#FFFFFF', '#7BADE3', '#5049CB', '#3E1A78'], name: 'GAY MEN' },
  { palette: ['#FF1B8D', '#FFDA00', '#1BB3FF'], name: 'PANSEXUAL' },
  { palette: ['#000000', '#A3A3A3', '#FFFFFF', '#810082'], name: 'ASEXUAL' },
  { palette: ['#B57EDC', '#FFFFFF', '#4A8123'], name: 'GENDERQUEER' },
  { palette: ['#FF75A2', '#F5F5F5', '#BE18D6', '#2C2C2C', '#333EBD'], name: 'GENDERFLUID' },
];

const gBgColor = '#ffffff';

let gAllLines = [];
let gSpacingScalar = 1.5;
let gFlagOffset;
let gFlagLineCount = 20;
let gWeightScalar = 0.01;

function setup() {
  // keep flag aspect ratio
  let flagAspect = 3 / 2;
  let w = windowWidth;
  let h = w / flagAspect;
  if (h > windowHeight) {
    h = windowHeight;
    w = h * flagAspect;
  }

  createCanvas(w, h);

  noFill();

  letsRiot();
  background(gBgColor);

  drawFlag();
}

function letsRiot() {
  let flag = random(gFlagDetails);

  let colorCount = flag.palette.length;
  gStrokeWeight = height * gWeightScalar;
  let spacing = gSpacingScalar * gStrokeWeight; //(totalLines * gStrokeWeight);
  gFlagOffset = (height - gFlagLineCount * spacing) / 2;
  let yp = gFlagOffset;

  let lineCount = floor(gFlagLineCount / colorCount);

  for (let stripeColor of flag.palette) {
    yp = addStripe(yp, lineCount, spacing, stripeColor);
  }
}

function addStripe(yp, lineCount, spacing, col) {
  for (let i = 0; i < lineCount; i++) {
    gAllLines.push(new StripeLine(yp, col));
    yp += spacing;
  }

  return yp;
}

function drawFlag() {
  let shuffledLines = shuffle(gAllLines);
  for (let line of shuffledLines) {
    line.draw();
  }
}

class StripeLine {
  constructor(yp, c) {
    this.points = [];
    this.color = c;
    this.createLine(yp);
  }

  createLine(yp) {
    this.points.push(createVector(-gStrokeWeight, yp));
    this.points.push(createVector(-gStrokeWeight, random(height)));

    for (let i = 0; i < 5; i++) {
      this.points.push(createVector(random(0.5 * width), random(height)));
    }
    this.points.push(createVector(random(0.4, 0.5) * width, random(0.25, 0.75) * height));
    this.points.push(createVector(random(0.5, 0.6) * width, yp));
    this.points.push(createVector(0.6 * width, yp));
    this.points.push(createVector(width, yp));
    this.points.push(createVector(width, yp));
  }

  draw() {
    this.drawLine(0, gStrokeWeight);
    this.drawLine(this.color, 0.5 * gStrokeWeight);
  }

  drawLine(c, w) {
    stroke(c);
    strokeWeight(w);
    beginShape();
    for (let pt of this.points) {
      curveVertex(pt.x, pt.y);
    }
    endShape();
  }
}
