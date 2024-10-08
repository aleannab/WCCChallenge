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

let world;

let rectangle;

let gUpdateGravityTime = 0;

let gGravity;

let gConstraintsCol = [];

let gRadiusMin = 5;
let gRadiusMax = 15;
let gConstraintMin = 1;
let gConstraintMax = 5;

let gColCount;
let gColPadding = 50;
let gRowPadding = 100;

let gParticleCount = 175;

let gIsDebug = false;

let gBackgroundColor = '#cccccc';
let gEraseColor = '#cccccc34';
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

  world = new c2.World(new c2.Rect(0, -height / 2, width, 2 * height));

  gGravity = new c2.ConstForce(new c2.Vector(0, 1));
  world.addForce(gGravity);

  let collision = new c2.Collision();
  collision.strength = 1; //0.5;
  world.addInteractionForce(collision);

  gColCount = floor(width / gColPadding) + 1;
  let adjColPad = floor(width / (gColCount - 1));

  gRowCount = floor(height / gRowPadding) + 1;

  for (let i = 0; i < gColCount; i++) {
    let xp = i * adjColPad;
    gConstraintsCol.push(new ConstraintsColumn(xp));
  }

  createParticleBrushes();
  strokeWeight(2);
  background(gBackgroundColor);
}

function createParticleBrushes() {
  world.particles = [];
  const mainHue = random(160, 220);
  const hueOffset = random(5, 20);

  for (let i = 0; i < gParticleCount; i++) {
    let x = random(width);
    let y = -5 * gRadiusMax; //random(-5, -height/2);//height);
    let p = new c2.Particle(x, y);
    p.radius = random(gRadiusMin, gRadiusMax);
    // if (i % 5 === 0) {
    //   p.color = gEraseColor;
    // } else {
    p.color = random(gPalette); //mainHue + random(-hueOffset, hueOffset), random(30, 60), random(20, 100), 0.3);
    // }
    p.mass = random(0.5, 2);

    world.addParticle(p);
  }
}

function draw() {
  // console.log(frameRate());
  if (gIsDebug) background(gBackgroundColor);

  let t = millis() * 0.001;
  for (let p of world.particles) {
    p.radius += random(-1, 1);
    if (p.radius > gRadiusMax) p.radius = gRadiusMax;
    if (p.radius < gRadiusMin) p.radius = gRadiusMin;
    if (p.position.y > height) {
      p.position.y = 0;
      p.color = random(gPalette);
    }
  }
  for (let col of gConstraintsCol) {
    col.update(t);
  }

  world.update();

  noStroke();
  for (let i = 0; i < world.particles.length; i++) {
    let p = world.particles[i];
    fill(p.color);

    let rad = gIsDebug ? p.radius : map(p.radius, gRadiusMin, gRadiusMax, 0, 10);
    circle(p.position.x, p.position.y, rad);
  }

  if (gIsDebug) {
    for (let col of gConstraintsCol) {
      col.draw();
    }
  }

  // let curTime = millis();
  // if (curTime > gUpdateGravityTime) {
  //   let randDirection = new c2.Vector(random(-1, 1), random(-1, 1));
  //   gGravity.force = randDirection.normalize();
  //   gUpdateGravityTime = curTime + 3000;
  // }
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
  background(gBackgroundColor);
  createParticleBrushes();
}

class ConstraintsColumn {
  constructor(initX) {
    this.data = [];

    for (let i = 0; i < gRowCount; i++) {
      let xp = initX + random(-0.2, 0.2) * gColPadding;
      let yp = i * gRowPadding + random(-0.5, 0.5) * gRowPadding;
      let circ = new c2.Circle(xp, yp, random(gConstraintMin, gConstraintMax));
      let circConstraint = new c2.CircleConstraint(circ);
      world.addConstraint(circConstraint);
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
      let curCircle = d.constraint.circle;
      circle(curCircle.p.x, curCircle.p.y, curCircle.r);
    }
  }
}
