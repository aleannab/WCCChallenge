// Created for the #WCCChallenge - Topic: Blue
//
// I interpreted this prompt to feeling blue.
// Tears are falling, but there is beauty and relief found within the sadness.
//
// I modified an old sketch that was made for a previous challenge: Gravity.
// This was created using a particle system for the paint strokes.
// There are moving rectangular obstacles across the canvas which you can view by pressing 'd' to toggle debug mode.
// Mouse click to start a new painting.
//
// Color palette is also taken from Picasso's Blue Period - The Old Guitarist
// https://colors.dopely.top/inside-colors/wp-content/uploads/2021/12/dopely-Pablo-Picasso-20.jpg
// ChatGPT helped me write a function that uses each color's percentage to decide how likely it is to be chosen.
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gGravity;

const gParticleCount = 175;

let gAllObstacles = [];
const gObstacleSpacing = {
  x: 100,
  y: 200,
};

const gConstraints = {
  particleSize: { min: 5, max: 15 },
  obstacleWidth: { min: 1, max: 5 },
  obstacleHeight: { min: 10, max: 100 },
};

const gBackgroundColor = '#CCCCCC';
const gPaletteWithPercentages = [
  { color: '#214A641A', percentage: 23.42 },
  { color: '#2466861A', percentage: 14.49 },
  { color: '#0B121A1A', percentage: 13.02 },
  { color: '#4B585D1A', percentage: 11.72 },
  { color: '#21303A1A', percentage: 10.24 },
  { color: '#1220301A', percentage: 9.18 },
  { color: '#78A4AB1A', percentage: 4.38 },
  { color: '#7DB1C51A', percentage: 4.06 },
  { color: '#4A7C8A1A', percentage: 3.78 },
  { color: '#357A9C1A', percentage: 3.2 },
  { color: '#64787C1A', percentage: 0.95 },
  { color: '#3584B41A', percentage: 0.94 },
  { color: '#328DB51A', percentage: 0.45 },
  { color: '#242C241A', percentage: 0.14 },
  { color: '#8C897F1A', percentage: 0.02 },
];
const gDebugObstacleColor = '#FF4500';
const gDebugParticleColor = '#00FFFF';

let gCumulative = [];

let gIsDebug = false;

let gArtCanvas;
let gDebugCanvas;

function setup() {
  createCanvas(windowWidth, windowHeight);
  gArtCanvas = createGraphics(width, height);
  gDebugCanvas = createGraphics(width, height);

  gArtCanvas.colorMode(HSL, 360, 100, 100);
  gArtCanvas.ellipseMode(RADIUS);
  gArtCanvas.strokeWeight(2);

  gDebugCanvas.ellipseMode(RADIUS);
  gDebugCanvas.strokeWeight(2);

  gWorld = new c2.World(new c2.Rect(-100, -height / 2, width + 200, 2 * height));

  gGravity = new c2.ConstForce(new c2.Vector(0, 1));
  gWorld.addForce(gGravity);

  let collision = new c2.Collision();
  collision.strength = 1;
  gWorld.addInteractionForce(collision);

  const obstacleColCount = floor(width / gObstacleSpacing.x) + 1;
  const adjColSpacing = floor(width / (obstacleColCount - 1));
  const rowCount = floor(height / gObstacleSpacing.y) + 1;

  for (let i = 0; i < obstacleColCount; i++) {
    const xp = i * adjColSpacing;
    gAllObstacles.push(new ObstaclesColumn(xp, rowCount));
  }

  // Calculate cumulative probabilities
  let sum = 0;
  for (let i = 0; i < gPaletteWithPercentages.length; i++) {
    sum += gPaletteWithPercentages[i].percentage;
    gCumulative.push(sum);
  }

  initialize();
}

function initialize() {
  gWorld.particles = [];

  for (let i = 0; i < gParticleCount; i++) {
    addParticle(-random(height / 2));
  }
  gArtCanvas.background(gBackgroundColor);
}

function draw() {
  if (gIsDebug) gDebugCanvas.clear();

  const t = millis() * 0.001;
  for (let p of gWorld.particles) {
    p.radius += random(-1, 1) * 0.75;
    p.radius = constrain(p.radius, gConstraints.particleSize.min, gConstraints.particleSize.max);
    if (p.position.y > height) {
      gWorld.removeParticle(p);
      addParticle();
    }
  }

  for (let obstacle of gAllObstacles) {
    obstacle.update(t);
  }

  gWorld.update();

  gArtCanvas.noStroke();
  for (let i = 0; i < gWorld.particles.length; i++) {
    const p = gWorld.particles[i];
    gArtCanvas.fill(p.color);
    const rad = map(p.radius, gConstraints.particleSize.min, gConstraints.particleSize.max, 0, 10);
    gArtCanvas.circle(p.position.x, p.position.y, rad);
    gDebugCanvas.stroke(gDebugParticleColor);
    gDebugCanvas.noFill();
    gDebugCanvas.circle(p.position.x, p.position.y, rad);
  }

  if (gIsDebug) {
    for (let obstacle of gAllObstacles) {
      obstacle.draw();
    }
  }

  image(gArtCanvas, 0, 0);
  if (gIsDebug) {
    image(gDebugCanvas, 0, 0);
  }
}

function addParticle(yp = 0) {
  const newParticle = new c2.Particle(random(-100, width + 100), yp);
  newParticle.radius = random(gConstraints.particleSize.min, gConstraints.particleSize.max);
  newParticle.color = getRandomColor(); //random(gPalette);
  newParticle.mass = random(0.5, 2);

  gWorld.addParticle(newParticle);
}

function keyPressed() {
  if (key == 'd') {
    gIsDebug = !gIsDebug;
  }
}

function mouseClicked() {
  initialize();
}

// uses probability of colors found in Picasso's Old Guitarist
function getRandomColor() {
  let rand = random(100);

  for (let i = 0; i < gCumulative.length; i++) {
    if (rand < gCumulative[i]) {
      return gPaletteWithPercentages[i].color;
    }
  }
  return random(gPaletteWithPercentages).color; // Fallback
}

class ObstaclesColumn {
  constructor(initX, rowCount) {
    this.data = [];

    for (let i = 0; i < rowCount; i++) {
      if (random() < 0.5) continue;
      const xp = initX + random(-0.5, 0.5) * gObstacleSpacing.x;
      const yp = i * gObstacleSpacing.y + random(-0.5, 0.5) * gObstacleSpacing.y;
      const rect = new c2.Rect(
        xp,
        yp,
        random(gConstraints.obstacleWidth.min, gConstraints.obstacleWidth.max),
        random(gConstraints.obstacleHeight.min, gConstraints.obstacleHeight.max)
      );
      const obRect = new c2.RectConstraint(rect);
      gWorld.addConstraint(obRect);
      this.data.push({
        obstacle: obRect,
        initPos: xp,
        timeOffset: random(0, TWO_PI),
        freq: random(0.2, 2),
        amp: random(2, 5),
        tScalar: random(0.01, 0.05),
      });
    }
    this.timeOffset = random(0, TWO_PI);
  }

  update(t) {
    for (let d of this.data) {
      d.obstacle.rect.p.x = d.initPos + d.amp * gObstacleSpacing.x * noise(d.freq * t + d.timeOffset);
      d.obstacle.rect.p.y += t * d.tScalar;
      if (d.obstacle.rect.p.y > height) {
        d.obstacle.rect.p.y = -gConstraints.obstacleHeight.max;
        d.obstacle.rect.p.w = random(gConstraints.obstacleWidth.min, gConstraints.obstacleWidth.max);
        d.obstacle.rect.p.h = random(gConstraints.obstacleHeight.min, gConstraints.obstacleHeight.max);
        d.timeOffset = random(0, TWO_PI);
        d.freq = random(0.2, 1);
        d.amp = random(2, 5);
        d.tScalar = random(0.01, 0.05);
      }
    }
  }

  draw() {
    gDebugCanvas.fill(gDebugObstacleColor);
    gDebugCanvas.stroke(gDebugObstacleColor);
    for (let d of this.data) {
      const obRect = d.obstacle.rect;
      gDebugCanvas.rect(obRect.p.x, obRect.p.y, obRect.w, obRect.h);
    }
  }
}
