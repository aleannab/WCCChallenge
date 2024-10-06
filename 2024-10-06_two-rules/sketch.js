// Created for the #WCCChallenge

let gCurrentFlock = [];

let gCurrentFlockLength = 10;
let gBorder;

function setup() {
  let l = min(windowWidth, windowHeight);
  createCanvas(l, l);

  gBorder = 0.2 * l;

  initialize();
  noFill();
  stroke(0, 0, 0, 0.1);
}

function draw() {
  // background(255);
  generate();
  gCurrentFlock.run();
  gCurrentFlock.draw();
}

function initialize() {
  background(255);

  gCurrentFlock = new Flock();
  gNextFlock = new Flock();
  for (let i = 0; i < gCurrentFlockLength; i++) {
    let xp = random(width);
    let yp = random(height);
    gCurrentFlock.addBoid(new Boid(xp, yp));
    gNextFlock.addBoid(new Boid(xp, yp));
  }
  gCurrentFlock.run();
}

function mouseClicked() {
  initialize();
}

// Create a new generation
function generate() {
  for (let i = 0; i < gCurrentFlockLength; i++) {
    let neighborCount = gCurrentFlock.boids[i].neighborCount;
    let desiredCount = gCurrentFlock.boids[i].desiredCount;

    // Rules of Life
    // 1. Any boid close to desired neighbor count freezes
    // 2. Any boid who doesn't have enough desired neighbors or too many, moves
    let before = gNextFlock.boids[i].isFrozen;
    if (neighborCount <= desiredCount && neighborCount >= desiredCount) {
      gNextFlock.boids[i].isFrozen = true;
      console.log(' ');
    } else {
      if (before) console.log('GOT UNFROZEN');

      gNextFlock.boids[i].isFrozen = false;
    }

    let temp = gCurrentFlock.boids[i].isFrozen;
    gCurrentFlock.boids[i].isFrozen = gNextFlock.boids[i].isFrozen;
    gNextFlock.boids[i].isFrozen = temp;
  }

  // Swap the current and next arrays for next generation
  // for (let i = 0; i < gCurrentFlockLength; i++) {
  //   let temp = gCurrentFlock.boids[i].isFrozen;
  //   gCurrentFlock.boids[i] = gNextFlock.boids[i].isFrozen;
  //   gNextFlock.boids[i] = temp;
  // }
}

// Flock class to manage the array of all the boids
class Flock {
  constructor() {
    // Initialize the array of boids
    this.boids = [];
  }

  run() {
    for (let boid of this.boids) {
      // Pass the entire list of boids to each boid individually
      boid.run(this.boids);
      boid.neighborCountUpdate(this.boids);
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }

  draw() {
    noFill();
    beginShape();
    for (let boid of this.boids) {
      // Pass the entire list of boids to each boid individually
      curveVertex(boid.position.x, boid.position.y);
    }
    endShape();
    // for (let boid of this.boids) {
    //   // Pass the entire list of boids to each boid individually
    //   boid.render();
    // }
  }
}

class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.size = 30.0;

    // Maximum speed
    this.maxSpeed = 30;

    // Maximum steering force
    this.maxForce = 0.05;
    colorMode(HSB);
    this.color = color(random(256), 255, 255);

    // Randomize if frozen
    this.isFrozen = true; //false; //random() < 0.5;
    this.neighborCount = 0; //int(random(5));
    this.desiredCount = int(random(gCurrentFlockLength) / 4);
  }

  // Clone method to create a deep copy of the Boid
  clone() {
    return new Boid(
      { ...this.position }, // Shallow copy the position (if it's an object)
      { ...this.velocity } // Shallow copy the velocity (if it's an object)
    );
  }

  run(boids) {
    if (!this.isFrozen) {
      this.flock(boids);
      this.update();
      this.borders();
    }

    // this.render();
  }

  neighborCountUpdate(boids) {
    let desiredSeparation = 100.0;
    let count = 0;

    // For every boid in the system, check if it's too close
    for (let boid of boids) {
      let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
        count++;
      }
    }
    this.neighborCount = count;
  }

  applyForce(force) {
    // We could add mass here if we want: A = F / M
    this.acceleration.add(force);
  }

  // We accumulate a new acceleration each time based on three rules
  flock(boids) {
    let separation = this.separate(boids);
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);

    // Arbitrarily weight these forces
    separation.mult(1.5);
    alignment.mult(1.0);
    cohesion.mult(1.0);

    // Add the force vectors to acceleration
    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
  }

  // Method to update location
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);

    // Limit speed
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    // A vector pointing from the location to the target
    let desired = p5.Vector.sub(target, this.position);

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxSpeed);

    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);

    // Limit to maximum steering force
    steer.limit(this.maxForce);
    return steer;
  }

  render() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + radians(90);
    fill(this.isFrozen ? 0 : this.color);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.size * 2);
    vertex(-this.size, this.size * 2);
    vertex(this.size, this.size * 2);
    endShape(CLOSE);
    pop();
  }

  // Wraparound
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

  // Separation
  // Method checks for nearby boids and steers away
  separate(boids) {
    let desiredSeparation = 25.0;
    let steer = createVector(0, 0);
    let count = 0;

    // For every boid in the system, check if it's too close
    for (let boid of boids) {
      let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boid.position);
        diff.normalize();

        // Scale by distance
        diff.div(distanceToNeighbor);
        steer.add(diff);

        // Keep track of how many
        count++;
      }
    }

    this.neighborCount = count;

    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
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

  // Cohesion
  // For the average location (i.e., center) of all nearby boids, calculate steering vector towards that location
  cohesion(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }
} // class Boid
