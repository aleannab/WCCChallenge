// Knotted Threads by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Knotwork
//
// I was initially inspired by the process of creating a macrame wall hanging.
// I have a bunch of 'threads' running vertically across the canvas.
// As you work your way downwards, adjacent threads are randomly knotted up.
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gThreads = [];
let gThreadCount;
let gKnotJunctions = [];
let gKnotRowCount;

let gThreadSpacing = 30;
let gThreadThickness = 2;
let gKnotSpacing = 50;
let gKnotRad = 2;

let gColorPalette = ['#d94e41', '#d9863d', '#f2b950', '#95bf93', '#46788c', '#556484'];
let gBgColor = '#f2f7f1';

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  noLoop();

  createMacrameHanging();
}

function createMacrameHanging() {
  gThreadSpacing = random(15, 50);
  gThreadThickness = random(1, 2);
  gKnotSpacing = random(15, 50);
  gKnotRad = map(gThreadThickness, 1, 2, 1.5, 0.75) * gThreadThickness;
  gKnotJunctions = [];
  gThreads = [];
  gThreadCount = floor(width / gThreadSpacing) + 2;
  gKnotRowCount = floor(height / gKnotSpacing) + 2;
  curveTightness(random(-0.5, 2));

  let spacingVarX = map(gThreadSpacing, 15, 50, 0.3, 0.1) * gThreadSpacing;
  let spacingVarY = random();
  for (let i = 0; i < gThreadCount; i++) {
    let knotRow = [];
    let xp = gThreadSpacing * i;
    for (let j = 0; j < gKnotRowCount; j++) {
      let yp = j * gKnotSpacing;
      if (j === 0) {
        yp -= random() * gKnotSpacing;
      } else if (j === gKnotRowCount - 1) {
        yp += random() * gKnotSpacing;
      } else {
        yp += random(-1, 1) * spacingVarY * gKnotSpacing;
      }
      knotRow.push(new Knot(xp + spacingVarX * sin(j + random(QUARTER_PI) * i), yp));
    }
    gKnotJunctions.push(knotRow);
  }

  for (let i = 0; i < gThreadCount; i++) {
    let threadIndex = i;
    let threadVertices = [];
    let threadColor = random(gColorPalette);
    for (let j = 0; j < gKnotRowCount; j++) {
      gKnotJunctions[threadIndex][j].addColor(threadColor);
      threadVertices.push(gKnotJunctions[threadIndex][j].pos);

      threadIndex = threadIndex + (random() < 0.5 ? -1 : 1);
      if (threadIndex < 0) threadIndex += 2;
      else if (threadIndex > gThreadCount - 1) threadIndex -= 2;
    }
    gThreads.push(new RopeString(threadVertices, threadColor));
  }

  for (let i = 0; i < gThreadCount; i++) {
    let threadColor = gThreads[i].color;
    for (let j = 0; j < gKnotRowCount; j++) {
      gKnotJunctions[i][j].addColor(threadColor);
    }
  }
}

function draw() {
  background(gBgColor);

  drawVertThreads();

  gThreads.forEach((rope) => {
    rope.draw();
  });

  gKnotJunctions.forEach((row) => {
    row.forEach((knot) => {
      knot.draw();
    });
  });
}

function drawVertThreads() {
  strokeWeight(gThreadThickness);

  for (let rope = 0; rope < gThreadCount; rope++) {
    stroke(gThreads[rope].color);
    beginShape();
    curveVertex(gKnotJunctions[rope][0].pos.x, gKnotJunctions[rope][0].pos.y);
    curveVertex(gKnotJunctions[rope][0].pos.x, gKnotJunctions[rope][0].pos.y);
    for (let row = 0; row < gKnotRowCount; row++) {
      let knotRef = gKnotJunctions[rope][row];
      if (knotRef.threadColors.length > 1) curveVertex(knotRef.pos.x, knotRef.pos.y);
    }
    curveVertex(gKnotJunctions[rope][gKnotRowCount - 1].pos.x, gKnotJunctions[rope][gKnotRowCount - 1].pos.y);
    curveVertex(gKnotJunctions[rope][gKnotRowCount - 1].pos.x, gKnotJunctions[rope][gKnotRowCount - 1].pos.y);
    endShape();
  }
}

function mouseClicked() {
  createMacrameHanging();
  redraw();
}

class RopeString {
  constructor(vertices, col) {
    this.vertices = vertices;
    this.color = col;
  }

  draw() {
    stroke(this.color);
    beginShape();
    curveVertex(this.vertices[0].x, this.vertices[0].y);
    this.vertices.forEach((vertex) => {
      curveVertex(vertex.x, vertex.y);
    });
    curveVertex(this.vertices[this.vertices.length - 1].x, this.vertices[this.vertices.length - 1].y);
    endShape();
  }
}

class Knot {
  constructor(xp, yp) {
    this.threadColors = [];
    this.pos = createVector(xp, yp);
  }

  addColor(col) {
    this.threadColors.push(col);
    this.vertices = [];
    let adjKnotRad = gKnotRad * (1 + 0.5 * this.threadColors.length);
    let offset = 0.5 * adjKnotRad;
    let vCount = 10;
    let angleInc = 360 / vCount;

    for (let i = 0; i < vCount; i++) {
      let angle = radians(angleInc * i);
      let adjRad = adjKnotRad + random(0, offset);
      let xp = adjRad * cos(angle);
      let yp = adjRad * sin(angle);
      this.vertices.push(createVector(xp, yp));
    }
  }

  draw() {
    if (this.threadColors.length <= 1) return;
    strokeWeight(gThreadThickness * 0.75);
    push();
    translate(this.pos.x, this.pos.y);
    for (let i = 0; i < 50; i++) {
      stroke(this.threadColors[i % this.threadColors.length]);
      let v0 = random(this.vertices);
      let v1 = random(this.vertices);
      line(v0.x, v0.y, v1.x, v1.y);
    }
    pop();
  }
}
