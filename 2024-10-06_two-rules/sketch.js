// Created for the #WCCChallenge

let gAllFlocks = [];

let gCurrentFlockLength = 8;
let gBorder = 0;
let gAlpha = 5;
let gIsDebug = false;

let gDebugColors = ['#3498db', '#db6e34'];

function setup() {
  let l = min(windowWidth, windowHeight);
  createCanvas(l, l);

  gBorder = 0.2 * l;

  gBgColor = 200;

  initialize();
  noFill();
  strokeWeight(5);
  stroke(0, 0, 0, 0.1);
}

function draw() {
  if (gIsDebug) background(gBgColor);
  generate();
  for (let flock of gAllFlocks) {
    flock.current.run();
    stroke(flock.current.color);
    flock.current.draw();
  }
}

function initialize() {
  background(gBgColor);
  gAllFlocks = [];

  for (let i = 0; i < 2; i++) {
    let val = i * 255;

    let c = new Flock(val, gDebugColors[i]);
    let n = new Flock(val, gDebugColors[i]);

    for (let i = 0; i < gCurrentFlockLength; i++) {
      let xp = random(gBorder, width - gBorder);
      let yp = random(gBorder, height - gBorder);
      c.addBoid(new Boid(xp, yp));
      n.addBoid(new Boid(xp, yp));
    }
    c.run();

    gAllFlocks.push({ current: c, next: n });
  }
}

function mouseClicked() {
  initialize();
}

function keyPressed() {
  if (key === 'd') {
    background(gBgColor);
    gIsDebug = !gIsDebug;
  }
}

// Create a new generation
function generate() {
  for (let flock of gAllFlocks) {
    for (let i = 0; i < flock.current.boids.length; i++) {
      let neighborCount = flock.current.boids[i].neighborCount;
      let desiredCount = flock.current.boids[i].desiredCount;

      // Rules of Life
      // 1. Any boid close to desired neighbor count freezes
      // 2. Any boid who doesn't have enough desired neighbors or too many, moves
      if (neighborCount >= desiredCount && neighborCount <= desiredCount + 1) {
        flock.next.boids[i].isFrozen = true;
      } else {
        flock.next.boids[i].isFrozen = false;
      }
    }

    // Swap the current and next arrays for next generation
    for (let i = 0; i < gCurrentFlockLength; i++) {
      let temp = flock.current.boids[i].isFrozen;
      flock.current.boids[i].isFrozen = flock.next.boids[i].isFrozen;
      flock.next.boids[i].isFrozen = temp;
    }
  }
}

// Flock class to manage the array of all the boids
class Flock {
  constructor(cVal, dcVal) {
    // Initialize the array of boids
    this.boids = [];
    this.color = color(cVal, cVal, cVal, gAlpha);
    this.colInc = 0; //-0.1;
    this.debugCol = color(red(dcVal), green(dcVal), blue(dcVal), 255);
    this.darkerDebugCol = lerpColor(this.debugCol, color(0, 0, 0), 0.5);
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
    noFill();
    if (gIsDebug) stroke(red(this.color), green(this.color), blue(this.color), 255);
    else stroke(red(this.color), green(this.color), blue(this.color), this.alpha);
    beginShape();
    for (let boid of this.boids) {
      if (!boid.isFrozen) curveVertex(boid.position.x, boid.position.y);
    }
    endShape();

    if (gIsDebug) {
      for (let boid of this.boids) {
        fill(boid.isFrozen ? this.darkerDebugCol : this.debugCol);
        // Pass the entire list of boids to each boid individually
        boid.render();
      }
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
    let desiredSeparation = width * 0.1;
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
    circle(0, 0, 50);
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
