// Beneath the Trees by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Branches
//
// Inspired by relaxing in nature, looking above,
// and noticing the intricate patterns of branches against the sky.
//
// This code is messssssssy. Might clean it up later.
// It utilizes a flocking system to assist in making the growth directions more organic.
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gFlock;
let gStartCount = 9;
let gLimit = 150;
let gDesiredSeparation = 600;
let gNeighborDist = 600;
let gBuffer = 60;

let gMaxSplitTime = 600;
let gMinSplitTime = 300;

let gProps = {};

const gBarkColor = ['#2f0e27', '#3a1329', '#200c1f'];

let gSkyColor = '#DAE8EC';

function setup() {
  createCanvas(1.778 * windowHeight, windowHeight);
  noStroke();

  gProps = {
    fMax: random(1, 4),
    sMax: random(100, 200),
    sep: 0.005,
    ali: 0.00002,
    coh: 0.001,
  };
  makeNewFlock();
  background(gSkyColor);
}

function makeNewFlock() {
  gFlock = new Flock(millis());
}

function draw() {
  gFlock.run(millis());
}

function mouseClicked() {
  background(gSkyColor);
  makeNewFlock();
}

class Flock {
  constructor(currentTime) {
    this.boids = [];

    for (let i = 0; i < gStartCount; i++) {
      let randPosition = createVector(random(width), random(height));
      if (random() > 0.5) {
        randPosition.x *= -1;
      } else {
        randPosition.y *= -1;
      }
      const randVelocity = createVector(random(width), random(height)).normalize();
      const randColor = random(gBarkColor);
      this.boids.push(new Boid(this, randPosition, randVelocity, randColor, random(60, 100), currentTime));
    }
  }

  run(time) {
    for (let b of this.boids) {
      b.run(this.boids, time);
      b.draw();
    }
  }

  addBoid(position, direction, color, radius, time, count) {
    if (this.boids.length < gLimit) {
      let currentAngle = atan2(direction.y, direction.x);

      for (let i = 0; i < count; i++) {
        let randomOffset = random(-PI / 6, PI / 6);
        let newAngle = currentAngle + randomOffset;
        let newDir = createVector(cos(newAngle), sin(newAngle));

        // Add a small random offset to the position to avoid overlap
        let offset = p5.Vector.random2D().mult(random(0.5, 1));
        let newPos = p5.Vector.add(position, offset);
        this.boids.push(new Boid(this, newPos, newDir, color, radius, time));
      }
    }
  }
}

class Boid {
  constructor(myFlock, position, direction, color, radius, time) {
    this.myFlock = myFlock;
    this.pos = position;
    this.vel = direction;
    this.radius = radius;
    this.timeSplit = time + random(1000, 6000);
    this.timeFreeze = this.timeSplit + random(600, 800);
    this.maxBranches = 3;
    this.currentBranchCount = 1;
    this.isFrozen = false;
    this.color = color;
    this.currentRadius = radius;
    this.radiusMin = random(0.4, 0.6) * radius;
  }

  run(boids, time) {
    if (this.isFrozen) return;
    if (time > this.timeFreeze) this.isFrozen = true;
    if (this.currentBranchCount > this.maxBranches) this.isFrozen = true;
    this.flock(boids);
    this.bounds();
    this.draw();

    if (time > this.timeSplit && random() > 0.6) {
      let count = int(random(1, 4));
      this.myFlock.addBoid(this.pos, this.vel, this.color, this.currentRadius, time, count);
      this.timeSplit += random(gMinSplitTime, gMaxSplitTime);
    }
    this.currentRadius = map(time / this.timeFreeze, 0, 1, this.radius, this.radiusMin);
  }

  draw() {
    if (this.isFrozen) return;
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.currentRadius);
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
