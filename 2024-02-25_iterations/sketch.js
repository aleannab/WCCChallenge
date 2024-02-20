// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gNumRows = 5;
let gRadiusScalar = 0.25;
let gGridSpacing;
let gRadius;

function setup() {
  let l = windowHeight < windowWidth ? windowHeight : windowWidth;
  createCanvas(l, l);

  gGridSpacing = l / gNumRows;
  gRadius = gRadiusScalar * gGridSpacing;

  if (isDebug) {
    initPanel();
    gOGSettings = settings.map((obj) => deepCopy(obj));
  }

  createNewArt();
  noLoop();
}

function draw() {
  //background(255);
}

function createNewArt() {
  background(255);

  // Nested loop to draw circles in a grid
  for (let x = gGridSpacing / 2; x < width; x += gGridSpacing) {
    for (let y = gGridSpacing / 2; y < height; y += gGridSpacing) {
      push(); // Save the current transformation state
      translate(x, y); // Move the origin to the current grid position
      drawCircle(); // Draw a circle at the translated position
      pop(); // Restore the previous transformation state
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
