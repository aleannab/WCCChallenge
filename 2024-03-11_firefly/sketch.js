// Rhythms in Darkness by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Firefly
//
// My sketch is inspired by the way fireflies flash in sync. Below is a quote from an article I read:
//
//     "Imagine an isolated firefly that has just emitted a burst of flashes, and consider the following rules.
//     If you sequester it now, it will wait a random interval before flashing again.
//     There is, however, a minimum wait time that the insect needs for recharging its light organs.
//     This firefly is also susceptible to peer pressure: If it sees another firefly starting to flash, it will flash too, as long as it physically can.
//
//     Now picture a whole field of fireflies in the quiet darkness immediately following a burst.
//     Each one picks a random wait time longer than the charging period.
//     Whoever flashes first, though, inspires all the others to jump in immediately.
//     This entire process repeats each time the field goes dark. As the number of fireflies increases,
//     it becomes increasingly likely that at least one will randomly choose to flash again
//     as soon as it’s biologically possible, and that will set off the rest.
//     As a result, the time between bursts shortens toward the minimum wait time.
//     Any scientists gawking at this scene will see what looks like a steady group rhythm of light rolling into darkness,
//     and then darkness erupting with light." --- Joshua Sokol
//
//     https://www.quantamagazine.org/how-do-fireflies-flash-in-sync-studies-suggest-a-new-answer-20220920/
//
// My firefly behavior roughly mimics the logic above.
// Additionally, I initialized each firefly with it's own color.
// If a firefly's flash is triggered by another's, it will take on the hue of the originator of the chain.
// If you let the program run long enough, the entire swarm's flashes will sync up perfectly. (To speed this up you can increase gNeighborDist)
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gFireflies;
let gCount = 150;
let gDesiredSeparation = 60;
let gNeighborDist = 100; // Increase this value to ~150 to speed up how long the flashes take to sync completely
let gBuffer = 10;
let gBrightnessMin = 0.2;
let gBrightnessMax = 0.8;
let gAlphaMin = 0.1;
let gAlphaMax = 0.5;
let gFadeDuration = 300;
let gHoldDuration = 200;
let gFlashDuration = 2 * gFadeDuration + gHoldDuration;
let gNewFlashInterval = 3000;
let gRecoverDuration = 1500;

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

    for (let i = 0; i < gCount; i++) {
      this.boids.push(new Firefly());
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
  constructor() {
    this.h = random(0.5, 1);
    this.dimColor = color(this.h, random(0.4, 1), gBrightnessMin, gBrightnessMin);
    this.currentColor = this.dimColor;
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();

    this.isFlashing = false;
    this.isRecovering = true;

    this.nextFlashTime = millis() + 2 * random(gNewFlashInterval);
    this.readyToGoTime = this.nextFlashTime - gNewFlashInterval;
    this.r = random(10, 50);

    this.flashLife = 0;
  }

  run(boids) {
    this.flashCheck(boids);
    this.flock(boids);
    this.bounds();
    this.draw();
  }

  flashCheck(boids) {
    let now = millis(); // Store the current time only once for efficiency
    if (this.isFlashing && now > this.flashDoneTime) {
      this.isFlashing = false;
      this.nextFlashTime = now + gNewFlashInterval;
      this.currentColor = this.dimColor;
    } else if (this.isFlashing) {
      this.flashLife = this.flashDoneTime - now;
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
    this.flashDoneTime = now + gFlashDuration;
    this.readyToGoTime = now + gRecoverDuration;
    this.currentColor = color(hue, saturation(this.dimColor), gBrightnessMin, gBrightnessMin);

    for (let boid of boids) {
      let d = p5.Vector.dist(this.pos, boid.pos);
      if (d > 0 && d < gNeighborDist) {
        boid.flash(boids, now, hue);
      }
    }
  }

  draw() {
    if (this.isFlashing) {
      this.updateBrightness();
    }

    fill(this.currentColor);
    ellipse(this.pos.x, this.pos.y, this.r);
  }

  updateBrightness() {
    let b;
    let flashLife = this.flashLife;
    if (flashLife < gFadeDuration) {
      b = map(flashLife, 0, gFadeDuration, gBrightnessMin, gBrightnessMax);
    } else if (flashLife >= 1 - gFadeDuration) {
      flashLife -= gFadeDuration + gFlashDuration;
      b = map(flashLife, 0, gFlashDuration, gBrightnessMax, gBrightnessMin);
    } else {
      b = gBrightnessMax;
    }

    this.currentColor = color(hue(this.currentColor), saturation(this.currentColor), b, b);
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
