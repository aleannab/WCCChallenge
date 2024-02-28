// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

let gCircles = [];
let gRowCount = 20;
let gColCount = 20;
let gBoxWidth, gBoxHeight;

let gSounds = [];
let gReallySound;
function preload() {
  soundFormats('mp3', 'ogg');
  gSounds.push(loadSound('nope00'));
  gSounds.push(loadSound('nope01'));
  gSounds.push(loadSound('nope02'));
  gSounds.push(loadSound('nope03'));

  gReallySound = loadSound('really');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

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
  if (random() < 0.01) {
    gReallySound.play();
  } else {
    gSounds[int(random(gSounds.length))].play();
  }

  //createNewArt();
}

function triggerHoveredCircle() {
  for (let c of gCircles) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < 25) {
      c.trigger();
    }
  }
}

class Circle {
  constructor(x, y) {
    this.angle = 0; // Initial angle for sine function
    this.amplitude = random(25, 50); // Initial amplitude of shaking
    this.x = x; // Horizontal position of the circle
    this.y = y; // Vertical position of the circle
    this.angleSpeed = random(0.2, 0.4);
    this.r = 0.5 * random(gBoxHeight, gBoxWidth);

    this.isAnimating = false;
  }

  trigger() {
    if (this.isAnimating) return;
    mouseClicked();
    this.isAnimating = true;
  }

  draw() {
    // Calculate horizontal position using sine function
    let offsetX = this.isAnimating ? sin(this.angle) * this.amplitude : 0;
    let xp = this.x + offsetX;

    // Draw the circle
    ellipse(xp, this.y, this.r, this.r);

    if (this.isAnimating) {
      // Update angle for next frame
      this.angle += this.angleSpeed; // Adjust speed of shaking

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
