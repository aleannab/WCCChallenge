// Flocking Base
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gFlock;
let gStartCount = 20;
let gLimit = 1000;
let gDesiredSeparation = 600;
let gNeighborDist = 600;
let gBuffer = 10;

let gMaxSplitTime = 5000;
let gMinSplitTime = 1000;

let gProps = {};

const gPaletteWithPercentages = [
  // { color: '#f4f1ea1A', percentage: 0 },
  { color: '#3567af1A', percentage: 0 },
  { color: '#c04e821A', percentage: 0 },
  { color: '#538e471A', percentage: 0 },
  { color: '#e887401A', percentage: 0 },
  { color: '#016d6f1A', percentage: 0 },
  { color: '#e25c431A', percentage: 0 },
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  gProps = {
    fMax: random(1, 4),
    sMax: random(100, 400),
    sep: 0.005,
    ali: 0.00002,
    coh: 0.0001,
  };
  makeNewFlock();
  background(255);
}

function makeNewFlock() {
  gFlock = new Flock(millis());
}

function draw() {
  // background(255);
  gFlock.run(millis());
}

class Flock {
  constructor(currentTime) {
    this.boids = [];

    for (let i = 0; i < gStartCount; i++) {
      const randPosition = createVector(random(width), random(height));
      const randVelocity = createVector(random(width), random(height)).normalize();
      const randColor = random(gPaletteWithPercentages).color;
      this.boids.push(new Boid(this, randPosition, randVelocity, randColor, currentTime));
    }
  }

  run(time) {
    for (let b of this.boids) {
      b.run(this.boids, time);
      b.draw();
    }
  }

  addBoid(position, direction, color, time, count) {
    if (this.boids.length < gLimit) {
      let currentAngle = atan2(direction.y, direction.x);

      for (let i = 0; i < count; i++) {
        let randomOffset = random(-PI / 6, PI / 6);
        let newAngle = currentAngle + randomOffset;
        let newDir = createVector(cos(newAngle), sin(newAngle));

        // Add a small random offset to the position to avoid overlap
        let offset = p5.Vector.random2D().mult(random(0.5, 1));
        let newPos = p5.Vector.add(position, offset);
        this.boids.push(new Boid(this, newPos, newDir, color, time));
      }
    }
  }
}

class Boid {
  constructor(myFlock, position, direction, color, time) {
    this.myFlock = myFlock;
    this.pos = position;
    this.vel = direction;
    this.radius = 5;
    this.timeSplit = time + random(500, 3000);
    this.timeFreeze = this.timeSplit + random(1000, 5000);
    this.maxBranches = 3;
    this.currentBranchCount = 1;
    this.isFrozen = false;
    this.color = color;
    this.currentRadius = 5;
  }

  run(boids, time) {
    if (this.isFrozen) return;
    if (time > this.timeFreeze) this.isFrozen = true;
    if (this.currentBranchCount > this.maxBranches) this.isFrozen = true;
    this.flock(boids);
    this.bounds();
    this.draw();

    if (time > this.timeSplit && random() > 0.6) {
      let count = int(random(1, 3));
      this.myFlock.addBoid(this.pos, this.vel, this.color, time, count);
      this.timeSplit += random(gMinSplitTime, gMaxSplitTime);
    }
    this.currentRadius = map(time / this.timeFreeze, 0, 1, this.radius, 0);
  }

  draw() {
    if (this.isFrozen) return;
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.currentRadius);
  }

  flock(boids) {
    let forceS = this.separate(boids).mult(gProps.sep);
    // let forceA = this.align(boids).mult(gProps.ali);
    // let forceC = this.cohesion(boids).mult(gProps.coh);

    // let a = forceS.add(forceA).add(forceC);

    this.vel.add(forceS);
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
