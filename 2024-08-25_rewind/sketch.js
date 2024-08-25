// Be Kind by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Rewind
//
//
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2blet gPattern;

let gColorPalette = ['#d6cbbb', '#b87b6a', '#bb343a', '#e3d66b', '#708087'];

let gBgColor = '#ffffff';

let gVhsTapes = [];

let gVhsWidth;
let gStrokeWeight = 4;

let g90sPalette = ['#00db96', '#49297e', '#90dcff', '#e10086', '#fdfb76'];

let gScalarsVHS = {
  caseH: 0.57,
  windowW: 0.95,
  labelW: 0.43,
  labelH: 0.26,
  reelD: 0.4,
  reelSpacing: 0.23,
  spoolD: 0.12,
  spoolExtra: [1, 0.5],
};

let gSizesVHS = {};

let gCoverLayer;

function setup() {
  createCanvas(windowWidth, windowHeight);

  gCoverLayer = createGraphics(width, height);
  gCoverLayer.rectMode(CENTER);
  gCoverLayer.noStroke();

  initialize();
}

function draw() {
  background(gBgColor);
  stroke(gBgColor);

  gVhsTapes.forEach((tape) => {
    tape.update();
    tape.draw();
  });

  image(gCoverLayer, 0, 0);
}

function initialize() {
  gCoverLayer.clear();
  let scalar = random(0.1, 0.2);
  gVhsWidth = scalar * width;
  gStrokeWeight = 10 * scalar;
  gSizesVHS.caseH = gVhsWidth * gScalarsVHS.caseH;
  gSizesVHS.windowW = gVhsWidth * gScalarsVHS.windowW;
  gSizesVHS.labelW = gVhsWidth * gScalarsVHS.labelW;
  gSizesVHS.labelH = gVhsWidth * gScalarsVHS.labelH;
  gSizesVHS.reelD = gVhsWidth * gScalarsVHS.reelD;
  gSizesVHS.reelSpacing = gVhsWidth * gScalarsVHS.reelSpacing;
  gSizesVHS.spoolD = gVhsWidth * gScalarsVHS.spoolD;
  gSizesVHS.spoolExtra = [];
  for (let i = 0; i < gScalarsVHS.spoolExtra.length; i++) {
    gSizesVHS.spoolExtra.push(gScalarsVHS.spoolExtra[i] * gSizesVHS.spoolD);
  }
  gSizesVHS.topTapePosOffset = gSizesVHS.reelSpacing + gSizesVHS.reelD / 3;
  gSizesVHS.topTapePosY = -gSizesVHS.caseH / 3;
  createVHS();
}

function createVHS() {
  gVhsTapes = [];

  gCount = int(width / (1.1 * gVhsWidth)) - 1;
  gBoxWidth = 1.1 * gVhsWidth;
  gCountY = floor(height / (1.2 * gSizesVHS.caseH)) - 1;
  let offsetY = (height - 1.2 * gSizesVHS.caseH * gCountY) / 2;
  let offsetX = (width - 1.1 * gVhsWidth * gCount) / 2;
  for (let i = 0; i < gCountY; i++) {
    let y = (0.5 + i) * (1.2 * gSizesVHS.caseH) + offsetY;
    for (let j = 0; j < gCount; j++) {
      gVhsTapes.push(new VHS((0.5 + j) * gBoxWidth + offsetX, y));
    }
  }
}

function mouseClicked() {
  initialize();
}

class VHS {
  constructor(x, y) {
    this.xp = x;
    this.yp = y;

    this.progress = random();
    this.inc = random(0.005, 0.01);

    this.createCover();
  }

  createCover() {
    g90sPalette = shuffle(g90sPalette);
    gCoverLayer.push();
    gCoverLayer.translate(this.xp, this.yp);

    // vhs case
    gCoverLayer.strokeWeight(gStrokeWeight);
    gCoverLayer.stroke(0);
    gCoverLayer.fill(g90sPalette[0]);
    gCoverLayer.rect(0, 0, gVhsWidth, gSizesVHS.caseH, gSizesVHS.reelD * 0.1);
    gCoverLayer.fill(g90sPalette[1]);
    gCoverLayer.rect(0, -0.5 * gSizesVHS.caseH, 1.01 * gVhsWidth, 0.15 * gSizesVHS.caseH);

    // vhs window
    gCoverLayer.noFill();
    gCoverLayer.strokeWeight(gStrokeWeight * 2);
    gCoverLayer.rect(0, 0, gSizesVHS.windowW, 0.95 * gSizesVHS.labelH, gSizesVHS.reelD * 0.2);
    gCoverLayer.erase();
    gCoverLayer.noStroke();
    gCoverLayer.fill(0);
    gCoverLayer.rect(0, 0, gSizesVHS.windowW, 0.95 * gSizesVHS.labelH, gSizesVHS.reelD * 0.2);
    gCoverLayer.noErase();
    gCoverLayer.noStroke();

    // vhs label
    gCoverLayer.fill(0);
    gCoverLayer.rect(0, 0, gSizesVHS.labelW + 2, gSizesVHS.labelH);
    gCoverLayer.fill(g90sPalette[0]);
    gCoverLayer.rect(0, 0, gSizesVHS.labelW, gSizesVHS.labelH + 2);
    gCoverLayer.fill(gBgColor); //g90sPalette[1]);
    gCoverLayer.strokeWeight(gStrokeWeight);
    gCoverLayer.stroke(0);
    gCoverLayer.rect(0, 0, 0.9 * gSizesVHS.labelW, gSizesVHS.labelH, gSizesVHS.reelD * 0.05);

    gCoverLayer.fill(g90sPalette[2]);
    gCoverLayer.rect(0, -0.35 * gSizesVHS.labelH, 0.9 * gSizesVHS.labelW, 0.3 * gSizesVHS.labelH, gSizesVHS.reelD * 0.05);
    gCoverLayer.fill(g90sPalette[3]);
    gCoverLayer.rect(0, -0.25 * gSizesVHS.labelH, 0.9 * gSizesVHS.labelW, 0.15 * gSizesVHS.labelH);
    gCoverLayer.fill(g90sPalette[1]);
    gCoverLayer.rect(0, -0.3 * gSizesVHS.labelH, 0.9 * gSizesVHS.labelW, 0.1 * gSizesVHS.labelH);

    for (let i = 0; i < 3; i++) {
      gCoverLayer.line(-0.3 * gSizesVHS.labelW, i * gSizesVHS.labelH * 0.1, 0.3 * gSizesVHS.labelW, i * gSizesVHS.labelH * 0.1);
    }

    gCoverLayer.pop();
  }

  update(t) {
    this.progress += this.inc;
    if (this.progress >= 1.0 || this.progress <= 0) this.inc = -this.inc;

    this.leftTapeD = map(this.progress, 0, 1, gSizesVHS.reelD, gSizesVHS.spoolD);
    this.rightTapeD = map(this.progress, 0, 1, gSizesVHS.spoolD, gSizesVHS.reelD);
    this.leftTapeX = -gSizesVHS.reelSpacing - this.leftTapeD / 2;
    this.rightTapeX = gSizesVHS.reelSpacing + this.rightTapeD / 2;
  }

  draw() {
    push();
    translate(this.xp, this.yp);

    noStroke();
    fill(0);
    circle(-gSizesVHS.reelSpacing, 0, this.leftTapeD);
    circle(gSizesVHS.reelSpacing, 0, this.rightTapeD);

    stroke(0);
    strokeWeight(2);
    noFill();
    beginShape();
    curveVertex(this.leftTapeX, 0);
    curveVertex(this.leftTapeX, 0);
    curveVertex(-gSizesVHS.topTapePosOffset, gSizesVHS.topTapePosY);
    curveVertex(0, gSizesVHS.topTapePosY);
    curveVertex(gSizesVHS.topTapePosOffset, gSizesVHS.topTapePosY);
    curveVertex(this.rightTapeX, 0);
    curveVertex(this.rightTapeX, 0);
    endShape();

    fill(255);
    gSizesVHS.spoolExtra.forEach((rad) => {
      circle(-gSizesVHS.reelSpacing, 0, rad);
      circle(gSizesVHS.reelSpacing, 0, rad);
    });

    pop();
  }
}
