// ___ by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Firefly
//
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gFireflies;
let gCount = 300;
let gDesiredSeparation = 50;
let gNeighborDist = 300;
let gBuffer = 10;

let gProps = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 1);
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

function mouseClicked() {
  //makeNewFlock();
}

function makeNewFlock() {
  gFireflies = new Flock();
}

function draw() {
  background(0);
  gFireflies.run();
}

class Flock {
  constructor() {
    this.boids = [];

    let props = {
      fMax: random(0.01, 1),
      sMax: random(4, 6),
      sep: 0.05,
      ali: 0.002,
      coh: 0.001,
    };

    for (let i = 0; i < gCount; i++) {
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
    this.dimColor = color(this.h, random(0.5, 1), 0.2, 0.1);
    this.currentColor = this.dimColor;
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();

    this.isFlashing = false;
    this.isRecovering = false;

    this.readyToGoTime = 0;
    this.nextFlashTime = random(5000);
    this.recoverInterval = 3000;
    this.flashInterval = 5000;
    this.r = random(5, 50);
  }

  run(boids) {
    this.flashCheck(boids);
    this.flock(boids);
    this.bounds();
    this.draw();
  }

  flashCheck(boids) {
    let now = millis();
    if (this.isFlashing && now > this.flashDoneTime) {
      this.isFlashing = false;
      this.currentColor = this.dimColor;
    } else if (this.isRecovering && now > this.readyToGoTime) {
      this.isRecovering = false;
    } else if (!this.isFlashing && now > this.nextFlashTime) {
      this.flash(boids, now, this.h);
    }
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

  draw() {
    fill(this.currentColor);
    ellipse(this.pos.x, this.pos.y, this.r);
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
