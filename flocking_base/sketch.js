// Flocking Base
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gFlock;
let gCount = 150;
let gDesiredSeparation = 60;
let gNeighborDist = 100;
let gBuffer = 10;

let gProps = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  gProps = {
    fMax: random(0.01, 1),
    sMax: random(4, 6),
    sep: 0.05,
    ali: 0.002,
    coh: 0.001,
  };
  makeNewFlock();
  background(0);
}

function makeNewFlock() {
  gFlock = new Flock();
}

function draw() {
  background(255);
  gFlock.run();
}

class Flock {
  constructor() {
    this.boids = [];

    for (let i = 0; i < gCount; i++) {
      this.boids.push(new Boid(random(width), random(height)));
    }
  }

  run() {
    for (let b of this.boids) {
      b.run(this.boids);
      b.draw();
    }
  }
}

class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.radius = 5;
    this.color = 0;
  }

  run(boids) {
    this.flock(boids);
    this.bounds();
    this.draw();
  }

  draw() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.radius);
  }

  flock(boids) {
    let forceS = this.separate(boids).mult(gProps.sep);
    let forceA = this.align(boids).mult(gProps.ali);
    let forceC = this.cohesion(boids).mult(gProps.coh);

    let a = forceS.add(forceA).add(forceC);

    this.vel.add(a);
    this.vel.limit(gProps.sMax);
    this.pos.add(this.vel);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.normalize();
    desired.mult(gProps.sMax);

    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(gProps.fMax);
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
      steer.mult(gProps.sMax);
      steer.sub(this.vel);
      steer.limit(gProps.fMax);
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
      sum.mult(gProps.sMax);
      steer = p5.Vector.sub(sum, this.vel);
      steer.limit(gProps.fMax);
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

  bounds() {
    if (this.pos.x < -gBuffer) this.pos.x = width + gBuffer;
    if (this.pos.y < -gBuffer) this.pos.y = height + gBuffer;
    if (this.pos.x > width + gBuffer) this.pos.x = -gBuffer;
    if (this.pos.y > height + gBuffer) this.pos.y = -gBuffer;
  }
}
