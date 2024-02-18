let global = [
  {
    name: 'gLineCount',
    value: 2,
    min: 1,
    max: 5,
    step: 1,
    label: '# Lines',
  },
  {
    name: 'gCurvePtCount',
    value: 40,
    min: 2,
    max: 1000,
    step: 1,
    label: '# Curve Points',
  },
];
// Created for the #Genuary2024 - Wobbly Function Day
// https://genuary.art/prompts#jan13

let gLines = [];
let gPalette = [];

let gHue;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  noStroke();

  gHue = random(0, 360);

  initVarHelper();
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
  let stringGlobalSettings = 'let global = ' + JSON.stringify(global, null, 4);
  copyToClipboard(stringGlobalSettings);
}

function createLines() {
  gLines = [];
  gPalette = [];

  // TODO: palette algorithm needs work
  let satInc = 20 / gLineCount;
  let brightInc = 10; //20 / (gLineCount - 1);

  const colCount = int(gLineCount) + 1;
  for (let i = 0; i < colCount; i++) {
    gPalette.push(color(gHue, i * satInc, i === 0 ? random(0, 15) : 95 - brightInc * (i - 1)));
  }

  gPalette = shuffle(gPalette);
  gBgColor = gPalette.pop();

  let count = gLineCount;
  let amp = 0.85 * height;
  let ampInc = amp / (count + 1);
  gPalette = shuffle(gPalette);
  for (let i = 0; i < count; i++) {
    gLines.push(new Line(amp, gPalette[i % gPalette.length]));
    amp -= ampInc;
  }
  gMillisStart = millis();
}

class Line {
  constructor(amp, col) {
    this.points = [];
    let xp = 0;
    let count = gCurvePtCount; //floor(random(40, 50));
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

function initVarHelper() {
  for (let gVar of global) {
    OPC.slider(gVar);
  }

  OPC.button('gRandomBtn', 'Randomize');
  OPC.button('gSetMinBtn', 'Set Min Bounds');
  OPC.button('gSetMaxBtn', 'Set Max Bounds');
  OPC.button('gCopySettingsBtn', 'Copy Settings');
}

//parameterChanged function is used every time a parameter is updated.
function parameterChanged(variableName, newValue) {
  createLines();
}

function updatePanel() {
  for (let gVar of global) {
    OPC.delete(gVar.name);
  }
  let div = document.getElementById('opc-control-panel');
  div.innerHTML = '';
  initVarHelper();
}

//buttonReleased function is used every time a button is released.
function buttonPressed(variableName) {
  if (variableName === 'gCopySettingsBtn') {
    mouseClicked();
  } else {
    if (variableName === 'gRandomBtn') {
      for (let gVar of global) {
        gVar.value = floor(random(gVar.min, gVar.max));
        window[gVar.name] = gVar.value;
      }
    } else if (variableName === 'gSetMinBtn') {
      for (let gVar of global) {
        gVar.value = window[gVar.name];
        gVar.min = window[gVar.name];
      }
    } else if (variableName === 'gSetMaxBtn') {
      for (let gVar of global) {
        gVar.value = window[gVar.name];
        gVar.max = window[gVar.name];
      }
    }
    updatePanel();
  }
}

function copyToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
