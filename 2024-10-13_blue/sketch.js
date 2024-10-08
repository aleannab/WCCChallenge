// Created for the #WCCChallenge - Topic: Blue
//
// I interpreted this prompt to feeling blue.
// Tears falling, but there is beauty in the sadness.
//
// I repurposed an old sketch (made for a previous challenge: Gravity).
// This was created using a particle system for the paint strokes.
// There are moving circular obstacles across the canvas which you can view by pressing 'd' to toggle debug mode.
// Mouse click to start a new painting.
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;

let gGravity;

let gAllObstacles = [];

let gParticleRadMin = 5;
let gParticleRadMax = 15;
let gObstacleRadMin = 1;
let gObstacleRadMax = 5;

let gColCount;
let gColPadding = 50;
let gRowPadding = 100;
let gParticleCount = 175;

let gIsDebug = false;

let gBackgroundColor = '#CCCCCC';
gPalette = [
  '#214A644D',
  '#2466864D',
  '#0B121A4D',
  '#4B585D4D',
  '#21303A4D',
  '#1220304D',
  '#78A4AB4D',
  '#7DB1C54D',
  '#4A7C8A4D',
  '#357A9C4D',
  '#64787C4D',
  '#3584B44D',
  '#328DB54D',
  '#242C244D',
  '#8C897F4D',
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 360, 100, 100);
  ellipseMode(RADIUS);
  strokeWeight(2);

  gWorld = new c2.World(new c2.Rect(0, -height / 2, width, 2 * height));

  gGravity = new c2.ConstForce(new c2.Vector(0, 1));
  gWorld.addForce(gGravity);

  let collision = new c2.Collision();
  collision.strength = 1;
  gWorld.addInteractionForce(collision);

  gColCount = floor(width / gColPadding) + 1;
  const adjColPad = floor(width / (gColCount - 1));
  gRowCount = floor(height / gRowPadding) + 1;

  for (let i = 0; i < gColCount; i++) {
    const xp = i * adjColPad;
    gAllObstacles.push(new ObstaclesColumn(xp));
  }

  initialize();
}

function initialize() {
  gWorld.particles = [];

  for (let i = 0; i < gParticleCount; i++) {
    const x = random(width);
    const y = -5 * gParticleRadMax;
    const p = new c2.Particle(x, y);
    p.radius = random(gParticleRadMin, gParticleRadMax);
    p.color = random(gPalette);
    p.mass = random(0.5, 2);

    gWorld.addParticle(p);
  }
  background(gBackgroundColor);
}

function draw() {
  // console.log(frameRate());
  if (gIsDebug) background(gBackgroundColor);

  const t = millis() * 0.001;
  for (let p of gWorld.particles) {
    p.radius += random(-1, 1);
    p.radius = constrain(p.radius, gParticleRadMin, gParticleRadMax);
    if (p.position.y > height) {
      p.position.y = 0;
      p.color = random(gPalette);
    }
  }

  for (let obstacle of gAllObstacles) {
    obstacle.update(t);
  }

  gWorld.update();

  noStroke();
  for (let i = 0; i < gWorld.particles.length; i++) {
    const p = gWorld.particles[i];
    fill(p.color);
    const rad = gIsDebug ? p.radius : map(p.radius, gParticleRadMin, gParticleRadMax, 0, 10);
    circle(p.position.x, p.position.y, rad);
  }

  if (gIsDebug) {
    for (let obstacle of gAllObstacles) {
      obstacle.draw();
    }
  }
}

function keyPressed() {
  if (key == 'd') {
    gIsDebug = !gIsDebug;
    if (!gIsDebug) {
      background(gBackgroundColor);
    }
  }
}

function mouseClicked() {
  initialize();
}

class ObstaclesColumn {
  constructor(initX) {
    this.data = [];

    for (let i = 0; i < gRowCount; i++) {
      const xp = initX + random(-0.2, 0.2) * gColPadding;
      const yp = i * gRowPadding + random(-0.5, 0.5) * gRowPadding;
      const circ = new c2.Circle(xp, yp, random(gObstacleRadMin, gObstacleRadMax));
      const circConstraint = new c2.CircleConstraint(circ);
      gWorld.addConstraint(circConstraint);
      this.data.push({ constraint: circConstraint, initPos: xp, timeOffset: random(0, TWO_PI) });
    }
    this.timeOffset = random(0, TWO_PI);
  }

  update(t) {
    for (let d of this.data) {
      d.constraint.circle.p.x = d.initPos + gRowPadding * sin(0.75 * t + d.timeOffset);
    }
  }

  draw() {
    noFill();
    stroke(50);
    for (let d of this.data) {
      const curCircle = d.constraint.circle;
      circle(curCircle.p.x, curCircle.p.y, curCircle.r);
    }
  }
}
