//  by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Community
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gFlock;
let gCurrentFlockLength = 8;
let gBorder = 0;
let gAlpha = 10;

let gBgColor;

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (3 * windowHeight) / 4;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(w, h);

  let l = min(windowWidth, windowHeight);

  gBorder = 0.1 * l;

  gBgColor = 200;

  initialize();
}

function draw() {
  background(gBgColor);
  generate();
  gFlock.current.run();
  gFlock.current.draw();
}

function initialize() {
  gCurrentFlockLength = int(random(7, 12));

  let c = new Flock();
  let n = new Flock();

  for (let i = 0; i < gCurrentFlockLength; i++) {
    let xp = random(gBorder, width - gBorder);
    let yp = random(gBorder, height - gBorder);
    c.addBoid(new Boid(xp, yp));
    n.addBoid(new Boid(xp, yp));
  }
  c.run();

  gFlock = { current: c, next: n };
  loop();
}

function mouseClicked() {
  initialize();
}

function keyPressed() {
  if (key === 'd') {
    gIsDebug = !gIsDebug;
  }
}

// Create a new generation
function generate() {
  for (let i = 0; i < gFlock.current.boids.length; i++) {
    let neighborCount = gFlock.current.boids[i].neighborCount;
    let desiredCount = gFlock.current.boids[i].desiredCount;

    // Rules of Life
    // 1. Any boid close to desired neighbor count freezes
    // 2. Any boid who doesn't have enough desired neighbors or too many, moves
    if (neighborCount >= desiredCount && neighborCount <= desiredCount) {
      gFlock.next.boids[i].isFrozen = true;
    } else {
      gFlock.next.boids[i].isFrozen = false;
    }
  }

  // Swap the current and next arrays for next generation
  for (let i = 0; i < gCurrentFlockLength; i++) {
    let temp = gFlock.current.boids[i].isFrozen;
    gFlock.current.boids[i].isFrozen = gFlock.next.boids[i].isFrozen;
    gFlock.next.boids[i].isFrozen = temp;
  }
}

// Flock class to manage the array of all the boids
class Flock {
  constructor() {
    // Initialize the array of boids
    this.boids = [];
    this.color = 0;
    this.colInc = 0;
    this.alpha = gAlpha;
  }

  run() {
    let frozenCount = 0;
    for (let boid of this.boids) {
      // Pass the entire list of boids to each boid individually
      boid.run(this.boids);
      boid.neighborCountUpdate(this.boids);
      if (boid.isFrozen) frozenCount++;
    }
    let colVal = red(this.color) + this.colInc;
    this.color = color(colVal, colVal, colVal, gAlpha);
    if (colVal > 255 || colVal < 0) {
      this.colInc = -this.colInc;
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }

  draw() {
    fill(0);
    for (let boid of this.boids) {
      boid.render();
    }
  }
}

class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.size = 30.0;

    this.maxSpeed = 500;
    this.maxForce = 0.05;

    // colorMode(HSB);

    this.isFrozen = false;
    this.neighborCount = 0;
    this.desiredCount = int(random(1, 0.5 * gCurrentFlockLength));
  }

  run(boids) {
    if (!this.isFrozen) {
      this.flock(boids);
      this.update();
      this.borders();
    }
  }

  neighborCountUpdate(boids) {
    let desiredSeparation = width * 0.2;
    let count = 0;

    for (let boid of boids) {
      let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

      if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
        count++;
      }
    }
    this.neighborCount = count;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  flock(boids) {
    let separation = this.separate(boids);
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);

    separation.mult(1.5);
    alignment.mult(1.0);
    cohesion.mult(1.0);

    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    this.acceleration.mult(0);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);

    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  render() {
    push();
    translate(this.position.x, this.position.y);
    circle(0, 0, 20);
    pop();
  }

  borders() {
    if (this.position.x < gBorder) {
      this.position.x = gBorder;
      this.velocity = createVector(random(), this.velocity.y);
    }

    if (this.position.y < gBorder) {
      this.position.y = gBorder;
      this.velocity = createVector(this.velocity.x, random());
    }

    if (this.position.x > width - gBorder) {
      this.position.x = width - gBorder;
      this.velocity = createVector(-random(), this.velocity.y);
    }

    if (this.position.y > height - gBorder) {
      this.position.y = height - gBorder;
      this.velocity = createVector(this.velocity.x, -random());
    }
  }
  separate(boids) {
    let desiredSeparation = 100.0;
    let steer = createVector(0, 0);
    let count = 0;

    for (let boid of boids) {
      let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

      if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, boid.position);
        diff.normalize();
        diff.div(distanceToNeighbor);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  align(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  cohesion(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].position);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return createVector(0, 0);
    }
  }
}
