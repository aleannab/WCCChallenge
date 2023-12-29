//Created by Ren Yuan

let world;

let rectangle;

let gUpdateGravityTime = 0;

let gGravity;

let gConstraintsCol = [];

let gRadiusMin = 5;
let gRadiusMax = 20;
let gConstraintMin = 5;
let gConstraintMax = 40;

let gColPadding = 80;
let gRowPadding = 80;

let gIsDebug = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 360, 100, 100);
  ellipseMode(RADIUS);

  world = new c2.World(new c2.Rect(0, 0, width, height));

  gGravity = new c2.ConstForce(new c2.Vector(0, 1));
  world.addForce(gGravity);

  let collision = new c2.Collision();
  collision.strength = 1; //0.5;
  world.addInteractionForce(collision);

  let colCount = floor(width / gColPadding) + 1;
  let adjColPad = floor(width / (colCount - 1));

  gRowCount = floor(height / gRowPadding) + 1;

  for (let i = 0; i < colCount; i++) {
    let xp = i * adjColPad;
    gConstraintsCol.push(new ConstraintsColumn(xp));
  }

  let num = (colCount > gRowCount ? colCount : gRowCount) * 2;
  for (let i = 0; i < num; i++) {
    let x = random(width);
    let y = random(height);
    let p = new c2.Particle(x, y);
    p.radius = random(gRadiusMin, gRadiusMax);
    p.color = color(random(0, 30), random(30, 60), random(20, 100));
    p.mass = random(0.1, 1);

    world.addParticle(p);
  }
  strokeWeight(2);
  background('#cccccc');
}

function draw() {
  if (gIsDebug) background('#cccccc');

  let t = millis() * 0.001;
  for (let p of world.particles) {
    p.radius += random(-1, 1);
    if (p.radius > gRadiusMax) p.radius = gRadiusMax;
    if (p.radius < gRadiusMin) p.radius = gRadiusMin;
  }
  for (let col of gConstraintsCol) {
    col.update(t);
  }

  world.update();

  noStroke();
  for (let i = 0; i < world.particles.length; i++) {
    let p = world.particles[i];

    //stroke(p.color);
    fill(180, saturation(p.color), lightness(p.color), 0.3);
    let rad = gIsDebug ? p.radius : map(p.radius, gRadiusMin, gRadiusMax, 0, 10);
    circle(p.position.x, p.position.y, rad); //rad);
    //point(p.position.x, p.position.y);
  }

  if (gIsDebug) {
    for (let col of gConstraintsCol) {
      col.draw();
    }
  }

  let curTime = millis();
  if (curTime > gUpdateGravityTime) {
    let randDirection = new c2.Vector(random(-1, 1), random(-1, 1));
    gGravity.force = randDirection.normalize();
    gUpdateGravityTime = curTime + 3000;
  }
}

function keyPressed() {
  if (key == 'd') {
    gIsDebug = !gIsDebug;
  }

  if (!gIsDebug) {
    background('#cccccc');
  }
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
      this.data.push({ constraint: circConstraint, initPos: yp, timeOffset: random(0, TWO_PI) });
    }
    this.timeOffset = random(0, TWO_PI);
  }

  update(t) {
    for (let d of this.data) {
      d.constraint.circle.p.y = d.initPos + gColPadding * sin(t + d.timeOffset);
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
