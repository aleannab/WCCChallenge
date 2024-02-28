// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gCircles = [];
let gRowCount = 15;
let gColCount = 30;
let gBoxWidth, gBoxHeight;

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (isDebug) {
    initPanel();
    gOGSettings = settings.map((obj) => deepCopy(obj));
  }
  gBoxWidth = width / gColCount;
  gBoxHeight = height / gRowCount;

  createNewArt();
}

function draw() {
  background(0);
  triggerHoveredCircle();
  for (let c of gCircles) {
    c.draw();
  }
}

function createNewArt() {
  for (let i = 1; i < gRowCount - 1; i++) {
    let y = i * gBoxHeight;
    for (let i = 1; i < gColCount - 1; i++) {
      let nI = new Circle(i * gBoxWidth, y);
      gCircles.push(nI);
    }
  }
}

function mouseClicked() {
  createNewArt();
}

function triggerHoveredCircle() {
  for (let c of gCircles) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < 25) {
      c.isAnimating = true;
    }
  }
}

class Circle {
  constructor(x, y) {
    this.angle = 0; // Initial angle for sine function
    this.amplitude = 50; // Initial amplitude of shaking
    this.x = x; // Horizontal position of the circle
    this.y = y; // Vertical position of the circle

    this.isAnimating = false;
  }

  draw() {
    // Calculate horizontal position using sine function
    let offsetX = this.isAnimating ? sin(this.angle) * this.amplitude : 0;
    let xp = this.x + offsetX;

    // Draw the circle
    ellipse(xp, this.y, 50, 50);

    if (this.isAnimating) {
      // Update angle for next frame
      this.angle += 0.2; // Adjust speed of shaking

      // Gradually decrease the amplitude
      this.amplitude *= 0.99; // Adjust damping factor
    }

    // Reset parameters if amplitude becomes very small
    if (this.amplitude < 1) {
      this.amplitude = 50; // Reset amplitude
      this.angle = 0; // Reset angle
      this.isAnimating = false;
    }
  }
}
