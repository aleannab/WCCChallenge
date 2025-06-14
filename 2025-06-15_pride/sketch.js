// Created for the #WCCChallenge

const gFlagDetails = [
  { palette: ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'], name: 'PRIDE' },
  { palette: ['#5BCEFA', '#F7A8B8', '#FFFFFF', '#F7A8B8', '#5BCEFA'], name: 'TRANS' },
  { palette: ['#D60270', '#D60270', '#9B4F96', '#0033A0', '#0033A0'], name: 'BISEXUAL' },
  { palette: ['#D62900', '#FF9B55', '#FFD780', '#FFFFFF', '#D461A6', '#BC3784', '#A60061'], name: 'LESBIAN' },
  { palette: ['#FFDA00', '#7900CD', '#FFDA00', '#7900CD', '#FFDA00'], name: 'INTERSEX' },
  { palette: ['#FFF433', '#FFFFFF', '#9B59D0', '#000000'], name: 'NONBINARY' },
  { palette: ['#078D70', '#26CEAA', '#99E8C2', '#FFFFFF', '#7BADE3', '#5049CB', '#3E1A78'], name: 'GAY MEN' },
  { palette: ['#FF1B8D', '#FFDA00', '#1BB3FF'], name: 'PANSEXUAL' },
  { palette: ['#000000', '#A3A3A3', '#FFFFFF', '#810082'], name: 'ASEXUAL' },
  { palette: ['#B57EDC', '#FFFFFF', '#4A8123'], name: 'GENDERQUEER' },
  { palette: ['#FF75A2', '#F5F5F5', '#BE18D6', '#2C2C2C', '#333EBD'], name: 'GENDERFLUID' },
  { palette: ['#000000', '#B9B9B9', '#FFFFFF', '#B8F483', '#FFFFFF', '#B9B9B9', '#000000'], name: 'AGENDER' },
  { palette: ['#3DA542', '#A7D379', '#FFFFFF', '#A9A9A9', '#000000'], name: 'AROMANTIC' },
  { palette: ['#203856', '#62AEDC', '#FFFFFF', '#ECCD00', '#E28C00'], name: 'ARO & ACE' },
];

const gBgColor = '#ffffff';

let gAllLines = [];
let gSpacingScalar = 1.5;
let gFlagLineCount = 20;
let gWeightScalar = 0.01;
let gControlPointCount = 5;

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

  gStrokeWeight = height * gWeightScalar;

  let colorCount = flag.palette.length;
  let lineCount = floor(gFlagLineCount / colorCount);

  let spacing = gSpacingScalar * gStrokeWeight;
  let flagOffset = random(0.2, 0.6) * height;

  let yp = flagOffset;

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
    // start offscreen
    let border = 0.2;
    let minHeight = border * height;
    let maxHeight = (1 - border) * height;
    this.points.push(createVector(-gStrokeWeight, yp));
    this.points.push(createVector(-gStrokeWeight, random(minHeight, maxHeight)));

    // random points
    let randOffset = random(0.6);
    for (let i = 0; i < gControlPointCount; i++) {
      let xp = random(i * 0.1, 0.6) * width;
      let yp = (random(i * 0.1, 0.6) + randOffset) * height;
      yp = constrain(yp, minHeight, maxHeight);
      this.points.push(createVector(xp, yp));
    }

    // transition points
    this.points.push(createVector(random(0.4, 0.7) * width, yp));

    // final horizontal line
    this.points.push(createVector(0.7 * width, yp));
    this.points.push(createVector(width, yp));
    this.points.push(createVector(width, yp));
  }

  draw() {
    curveTightness(random(-5, 0));

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
