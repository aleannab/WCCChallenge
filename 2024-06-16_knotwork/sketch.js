// Created for the #Genuary2024 - In the style of Anni Albers (1899-1994).
// https://genuary.art/prompts#jan11
// Inspired by Anni Albers, Dotted, 1959

let gRopeStrings = [];
let gRopeCount;
let gRowSpacing = 50;
let gRopeSpacing = 30;
let gKnotRad = 1.5;
let gRopeThickness = 1;

let gKnotJunctions = [];

let gColorPalette = ['#d94e41', '#d9863d', '#f2b950', '#95bf93', '#46788c', '#556484'];
let gBgColor = '#f2f7f1';

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  strokeWeight(gRopeThickness);

  createMacrameHanging();
}

function createMacrameHanging() {
  gRopeCount = floor(width / gRopeSpacing) + 1;
  gRowCount = floor(height / gRowSpacing) + 2;

  for (let i = 0; i < gRopeCount; i++) {
    let knotRow = [];
    let ropeX = gRopeSpacing * (i + random(-0.4, 0.4));
    for (let j = 0; j < gRowCount; j++) {
      let yp = j * gRowSpacing;
      if (j != 0 && j != gRowCount - 1) {
        yp += random(-1, 1) * gRowSpacing;
      }
      knotRow.push(new Knot(ropeX + 0.2 * sin(j) * gRopeSpacing, yp));
    }
    gKnotJunctions.push(knotRow);
  }

  for (let i = 0; i < gRopeCount; i++) {
    let ropePosition = i;
    let ropeVertices = [];
    let ropeColor = random(gColorPalette);
    for (let j = 0; j < gRowCount; j++) {
      gKnotJunctions[ropePosition][j].addColor(ropeColor);
      ropeVertices.push(gKnotJunctions[ropePosition][j].pos);

      ropePosition = ropePosition + (random() < 0.5 ? -1 : 1);
      if (ropePosition < 0) ropePosition += 2;
      else if (ropePosition > gRopeCount - 1) ropePosition -= 2;
    }
    gRopeStrings.push(new RopeString(ropeVertices, ropeColor));
  }

  for (let i = 0; i < gRopeCount; i++) {
    let ropeColor = gRopeStrings[i].color;
    for (let j = 0; j < gRowCount; j++) {
      gKnotJunctions[i][j].addColor(ropeColor);
    }
  }
}

function draw() {
  background(gBgColor);

  for (let rope = 0; rope < gRopeCount; rope++) {
    stroke(gRopeStrings[rope].color);
    beginShape();
    curveVertex(gKnotJunctions[rope][0].pos.x, gKnotJunctions[rope][0].pos.y);
    curveVertex(gKnotJunctions[rope][0].pos.x, gKnotJunctions[rope][0].pos.y);
    for (let row = 0; row < gRowCount; row++) {
      let knotRef = gKnotJunctions[rope][row];
      if (knotRef.threadColors.length > 1) curveVertex(knotRef.pos.x, knotRef.pos.y);
    }
    curveVertex(gKnotJunctions[rope][gRowCount - 1].pos.x, gKnotJunctions[rope][gRowCount - 1].pos.y);
    curveVertex(gKnotJunctions[rope][gRowCount - 1].pos.x, gKnotJunctions[rope][gRowCount - 1].pos.y);
    endShape();
  }

  gRopeStrings.forEach((rope) => {
    rope.draw();
  });

  gKnotJunctions.forEach((row) => {
    row.forEach((knot) => {
      knot.draw();
    });
  });
}

class RopeString {
  constructor(vertices, col) {
    this.vertices = vertices;
    this.color = col;
  }

  draw() {
    stroke(this.color);
    noFill();
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
    this.randSeed = xp * yp;
    this.threadColors = [];
    this.pos = createVector(xp, yp);
  }

  addColor(col) {
    this.threadColors.push(col);
    this.vertices = [];
    let adjKnotRad = gKnotRad * (1 + 0.5 * this.threadColors.length);
    let offset = 0.5 * adjKnotRad;
    let vCount = 5;
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
    randomSeed(this.randSeed);
    if (this.threadColors.length <= 1) return;
    strokeWeight(this.gRopeThickness / 2);
    noFill();
    push();
    translate(this.pos.x, this.pos.y);
    for (let i = 0; i < 50; i++) {
      stroke(random(this.threadColors));
      let v0 = random(this.vertices);
      let v1 = random(this.vertices);
      line(v0.x, v0.y, v1.x, v1.y);
    }
    pop();
  }
}
