// Created for the #Genuary2024 - Day 19 - Flocking
// https://genuary.art/prompts#jan19

let gFlocks = [];
let gFlockCount = 1;
let gFlockSize = 300;
let gDesiredSeparation = 50;
let gNeighborDist = 300;
let gBuffer = 10;

let gHueShift;

let gPause = false;

let gPalette = ['#809bce', '#95b8d1', '#b8e0d2', '#d6eadf', '#eac4d5'];

let gBgColor = '#fee6e0';

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 1);
  noStroke();
  gHueShift = -1;
  makeNewFlock();
  background(0);
}

function mouseClicked() {
  makeNewFlock();
}

function makeNewFlock() {
  gHueShift = gHueShift < 0 ? 0 : gHueShift + random(0.2, 0.25);
  background(gBgColor);

  gFlocks = [];
  for (let i = 0; i < gFlockCount; i++) {
    gFlocks.push(new Flock());
  }
}

function keyTyped() {
  if (key === ' ') gPause = !gPause;
  else if (key === 'c') background(gBgColor);
  else if (key === 'n') {
    background(gBgColor);
    makeNewFlock();
    gPause = false;
  }
}

function draw() {
  console.log(frameRate());
  background(0);
  if (gPause) return;
  for (let flock of gFlocks) {
    flock.run();
  }
}

class Flock {
  constructor() {
    this.col = color(random(), 1, 1, 0.05);
    this.boids = [];

    let props = {
      col: random(gPalette),
      fMax: random(0.01, 1),
      sMax: random(4, 6),
      sep: 0.05, //random(0.5, 2),
      ali: 0.002, //random(0.5, 2),
      coh: 0.001, //random(0.2, 0.5),
    };

    for (let i = 0; i < gFlockSize; i++) {
      this.boids.push(new Firefly(props));
    }
  }

  run() {
    for (let b of this.boids) {
      b.run(this.boids);
      b.draw();
    }
  }
}

class Firefly {
  constructor(props) {
    this.h = random(0.5, 1);
    this.s = random(0.5, 1);
    this.dimColor = color(this.h, this.s, 0.2, 0.1);
    this.currentColor = this.dimColor;
    this.pos = createVector(random(width), random(height));
    let angle = random(TWO_PI);
    this.vel = createVector(cos(angle), sin(angle));
    this.forceMax = props.fMax;
    this.speedMax = props.sMax;
    this.scalarS = props.sep;
    this.scalarA = props.ali;
    this.scalarC = props.coh;

    this.isFlashing = false;
    this.isRecovering = false;

    this.readyToGoTime = 0;
    this.nextFlashTime = random(5000);
    this.recoverInterval = 3000; //random(1000, 3000);
    this.flashInterval = 5000;
    this.r = random(5, 50);
  }

  run(boids) {
    let now = millis();
    if (this.isFlashing) {
      if (now > this.flashDoneTime) {
        this.isFlashing = false;
        this.currentColor = this.dimColor;
      }
    } else {
      if (this.isRecovering && now > this.readyToGoTime) {
        this.isRecovering = false;
      }

      if (now > this.nextFlashTime) {
        this.flash(boids, now, this.h);
      }
    }

    this.flock(boids);
    this.bounds();
    this.draw();
  }

  flash(boids, now, hue) {
    if (this.isRecovering || this.isFlashing) return;

    this.isFlashing = true;
    this.isRecovering = true;
    this.flashDoneTime = now + 1000;
    this.nextFlashTime = now + this.flashInterval;
    this.readyToGoTime = now + this.recoverInterval;
    this.currentColor = color(hue, 1, 1, 0.5);

    for (let boid of boids) {
      let d = p5.Vector.dist(this.pos, boid.pos);
      if (d > 0 && d < gDesiredSeparation) {
        boid.flash(boids, now, hue);
      }
    }
  }

  flock(boids) {
    let forceS = this.separate(boids);
    let forceA = this.align(boids);
    let forceC = this.cohesion(boids);
    forceS.mult(this.scalarS);
    forceA.mult(this.scalarA);
    forceC.mult(this.scalarC);

    let a = forceS;
    a.add(forceA);
    a.add(forceC);

    this.vel.add(a);
    this.vel.limit(this.speedMax);
    this.pos.add(this.vel);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.normalize();
    desired.mult(this.speedMax);

    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.forceMax);
    return steer;
  }

  separate(boids) {
    let steer = createVector(0, 0);
    let count = 0;
    for (let boid of boids) {
      let d = p5.Vector.dist(this.pos, boid.pos);
      if (d > 0 && d < gDesiredSeparation) {
        let diff = p5.Vector.sub(this.pos, boid.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.speedMax);
      steer.sub(this.vel);
      steer.limit(this.forceMax);
    }

    return steer;
  }
  align(boids) {
    let sum = createVector(0, 0);
    let steer = createVector(0, 0);
    let count = 0;
    for (let boid of boids) {
      let d = p5.Vector.dist(this.pos, boid.pos);
      if (d > 0 && d < gNeighborDist) {
        sum.add(boid.vel);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.speedMax);
      steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.forceMax);
    }
    return steer;
  }

  cohesion(boids) {
    let sum = createVector(0, 0);
    let count = 0;
    for (let boid of boids) {
      let d = p5.Vector.dist(this.pos, boid.pos);
      if (d > 0 && d < gNeighborDist) {
        sum.add(boid.pos);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    }
    return createVector(0, 0);
  }

  draw() {
    let theta = this.vel.heading() + HALF_PI;

    push();
    translate(this.pos.x, this.pos.y);
    rotate(theta);
    fill(this.currentColor);
    ellipse(0, 0, this.r);

    pop();
  }

  bounds() {
    if (this.pos.x < -gBuffer) this.pos.x = width + gBuffer;
    if (this.pos.y < -gBuffer) this.pos.y = height + gBuffer;
    if (this.pos.x > width + gBuffer) this.pos.x = -gBuffer;
    if (this.pos.y > height + gBuffer) this.pos.y = -gBuffer;
  }

  clamp(value, minRange, maxRange) {
    return min(max(value, minRange), maxRange);
  }
}
