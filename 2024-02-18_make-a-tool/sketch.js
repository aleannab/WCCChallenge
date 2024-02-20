// Sketch Parameter Range Helper by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Make a Tool
// Using a previous sketch (made for #Genuary2024 Wobbly Function) for demo purposes
//
// I made this tool to make my workflow more efficient, so parts of it may or may not be useful to you.
// Generally when creating a sketch, I initialize specific parameters at the start.
// The values are randomly chosen within pre-determined range to allow variation between generating new sketches.
//
// How to use:
// (1) Update the settings file to include all the properties you desire.
// (2) Make any changes to your sketch to reference these new values.
// (3) Experiment with the tool to find desired ranges for each parameter.
// (4) Copy new settings, and overwrite the old settings.
//
// Features I'd like to add:
// (1) Update sliders to allow selection of both minimum and maximum points within the range.
// (2) Instead of reinitializing all values when a slider is changed - only alter the relevant values
//     (e.g. changing hue would still keep the same lines to avoid animation choppiness)
// (3) Ability to lock parameters so they're not affected by Randomize
// (4) Ability to overwrite the old settings file so I don't have to copy/paste when running the sketch locally.
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gLines = [];
let gPalette = [];

let gHue;
let gOGSettings;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  noStroke();

  gHue = random(0, 360);

  initPanel();
  gOGSettings = settings.map((obj) => deepCopy(obj));
  createLines();
}

function draw() {
  background(gBgColor);

  let dt = millis() - gMillisStart;

  let isEven = false;
  for (let line of gLines) {
    let offset = isEven ? 0 : PI;
    line.update(dt * 0.0005 + offset);
    line.draw();
    isEven = !isEven;
  }
}

function mouseClicked() {
  let stringSettings = 'let settings = ' + JSON.stringify(settings, null, 4);
  copyToClipboard(stringSettings);
}

function createLines() {
  gLines = [];
  gPalette = [];

  const lineCount = int(gPanel.getValue('Line Count'));
  const sat = int(gPanel.getValue('Saturation Level'));
  const bright = int(gPanel.getValue('Brightness Level'));
  const hue = int(gPanel.getValue('Hue Value'));

  // TODO: palette algorithm needs work
  let satInc = (sat * 10) / lineCount;
  let brightInc = (10 - bright) * 10; //20 / (gLineCount - 1);

  const colCount = int(lineCount) + 1;
  for (let i = 0; i < colCount; i++) {
    gPalette.push(color(hue, i * satInc, i === 0 ? random(0, 15) : 95 - brightInc * (i - 1)));
  }

  gPalette = shuffle(gPalette);
  gBgColor = gPalette.pop();

  let amp = 0.85 * height;
  let ampInc = amp / (lineCount + 1);
  gPalette = shuffle(gPalette);
  for (let i = 0; i < lineCount; i++) {
    gLines.push(new Line(amp, gPalette[i % gPalette.length]));
    amp -= ampInc;
  }
  gMillisStart = millis();
}

class Line {
  constructor(amp, col) {
    this.points = [];
    let xp = 0;
    let count = int(gPanel.getValue('Vertex Count'));
    let inc = width / count;
    this.amp = amp;
    this.spaceFreq0 = random(0.3, 0.7);
    this.spaceFreq1 = this.spaceFreq0 + random(-0.3, 0.3);
    this.timeFreq0 = random(0.5, 1.0);
    this.timeFreq1 = random(0.5, 1.0);

    for (let i = 0; i < count + 1; i++) {
      this.points.push(createVector(xp, 0));
      xp += inc;
    }

    this.firstPoint = this.points[0];
    this.lastPoint = this.points[count];
    this.color = col;
  }

  update(t) {
    for (let point of this.points) {
      point.y =
        height * 0.5 +
        this.amp * sin(this.spaceFreq0 * point.x - this.timeFreq0 * t + 1 + 1.5 * sin(this.spaceFreq1 * point.x + this.timeFreq1 * t + 5) ** 3);
    }
  }

  draw() {
    fill(this.color);
    beginShape();
    vertex(this.firstPoint.x, this.firstPoint.y);
    for (let point of this.points) {
      curveVertex(point.x, point.y);
    }
    vertex(this.lastPoint.x, this.lastPoint.y);
    endShape();
  }
}
