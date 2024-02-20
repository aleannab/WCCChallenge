// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gNumRows = 5;
let gRadiusScalar = 0.2;
let gGridSpacing;
let gRadius;

let gIterations = [];

function setup() {
  let l = windowHeight < windowWidth ? windowHeight : windowWidth;
  createCanvas(l, l);

  gGridSpacing = l / gNumRows;
  gRadius = gRadiusScalar * gGridSpacing;

  if (isDebug) {
    initPanel();
    gOGSettings = settings.map((obj) => deepCopy(obj));
  }

  stroke(0);
  noFill();
  createNewArt();
  noLoop();
}

function draw() {
  background(255);

  for (let box of gIterations) {
    box.draw();
  }
}

function createNewArt() {
  gIterations = [];

  let startVertices = [];
  for (let i = 0; i < TWO_PI; i += PI / 30) {
    let vX = cos(i) * gRadius;
    let vY = sin(i) * gRadius;
    startVertices.push(createVector(vX, vY));
  }
  // Nested loop to draw circles in a grid
  for (let y = gGridSpacing / 2; y < height; y += gGridSpacing) {
    for (let x = gGridSpacing / 2; x < width; x += gGridSpacing) {
      let next;
      let nI = new NthIteration(x, y, startVertices);
      console.log(startVertices);
      startVertices = nI.vertices;
      gIterations.push(nI);
    }
  }
}

function drawCircle() {
  noStroke();
  fill(random(255), random(255), random(255)); // Random color for each circle
  ellipse(0, 0, gRadius * 2); // Draw circle at translated position
}

function mouseClicked() {
  createNewArt();
}

class NthIteration {
  constructor(x, y, vs) {
    this.x = x;
    this.y = y;

    this.vertices = this.moveVertices(vs);
  }

  moveVertices(vs) {
    let newVs = [];
    for (let v of vs) {
      let xp = v.x + random(-1, 1) * 10;
      let yp = v.y + random(-1, 1) * 10;
      newVs.push(createVector(xp, yp));
    }
    return newVs;
  }

  draw() {
    push();
    translate(this.x, this.y);
    this.drawShape();
    pop();
  }

  drawShape() {
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}
