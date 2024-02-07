// Created for the #WCCChallenge - Topic: Blobs
//
// When the topic of blobs was chosen, I knew I wanted to play around with soft body physics.
// I was inspired by some creative code blobby sketches by Roni Kaufman and Juhani Halkomaki
// that I discovered through this article: https://www.gorillasun.de/blog/soft-body-physics-and-blobs/
//
// If you're interested in viewing the underlying spring system you can turn on debug mode by pressing 'd'
// (Note: debug mode also prevents new blobs from spawning, but you can always toggle it if you want to add more)
//
// My color palette is inspired by nudibranch sea blobs. They are otherworldly and stunning! Look them up if you're not familiar.
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gBlobs = [];

let gIsDebug = false;
let gBuffer;
let gBoundY;
let gResetTime = 0;
let gRadius;

let gBgColor = '#1E1E29';
let gBlobPalette = ['#79b7ba', '#9f1fde', '#fb6a0c', '#8de28e', '#e3dee6'];

function setup() {
  let l = windowWidth < windowHeight ? windowWidth : windowHeight;
  createCanvas(l, l);
  gBuffer = 20;
  gWorld = new c2.World(new c2.Rect(0, -gBuffer, width, height + gBuffer));

  gBoundY = 20;
  let count = 3;
  let incX = width / count;
  let incY = height / count;
  gRadius = incX / 5;
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      createBlob((i + 0.5) * incX, (j + 0.5) * incY);
    }
  }

  addWorldForces(); // gravity and collision
}

function draw() {
  background(gBgColor);

  gWorld.update();

  gBlobs.forEach((blob) => {
    blob.update();
    blob.draw();
  });
}

function addWorldForces() {
  quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height));
  let collision = new c2.Collision(quadTree);
  collision.iterations = 10;
  gWorld.addInteractionForce(collision);
}

function createBlob(posX = -1, posY = -30) {
  gBlobs.push(new Blob(new c2.Vector(posX, posY)));
}

class Blob {
  constructor(pos) {
    this.allPoints = [];
    this.springs = [];
    this.mass = 1;
    this.color = random(gBlobPalette);

    this.createBody(pos);
    this.offset = 0; //random(TWO_PI);
    this.frequency = 0.04; // random(0.03, 0.04);
  }

  update() {
    const amplitude = 5.5; // Adjust the amplitude of expansion and contraction
    const damping = 0.6;

    for (let i = 0; i < this.allPoints.length; i++) {
      const point = this.allPoints[i];

      const timeFactor = 1 + sin(frameCount * this.frequency + this.offset);

      // Use sine function to create oscillation
      const expansionFactor = timeFactor * amplitude;

      // Dampen the oscillation using damping
      point.radius = 1.5 * expansionFactor; // - point.radius;

      // Update spring lengths based on the adjusted radius
      for (let j = 0; j < this.springs.length; j++) {
        const spring = this.springs[j];
        spring.s.length = spring.l * expansionFactor * damping;
        //spring.s.strength = spring.f * timeFactor; //
      }
    }
  }

  createBody(pos) {
    const count = floor(gRadius);
    const angInc = TWO_PI / count;
    const r = floor(gRadius);

    // Create particles
    for (let i = 0; i < count; i++) {
      const angle = i * angInc;
      const x = r * cos(angle) + pos.x;
      const y = r * sin(angle) + pos.y;
      this.allPoints.push(this.createParticle(x, y));
    }

    // Create springs
    for (let i = 0; i < count; i++) {
      const currentPoint = this.allPoints[i];

      // Connect to the next neighbor
      for (let i = 0; i < count; i++) {
        const currentPoint = this.allPoints[i];

        // Connect to the next neighbor
        const nextIndex = (i + 1) % count;
        const nextPoint = this.allPoints[nextIndex];
        this.createSpring(currentPoint, nextPoint);

        // Connect to the opposite point across the center
        const oppositeIndex = (i + count / 2) % count;
        const oppositePoint = this.allPoints[oppositeIndex];
        // this.createSpring(currentPoint, oppositePoint);
      }
    }
  }

  createParticle(posX, posY) {
    let p = new c2.Particle(posX, posY);
    p.radius = 20;
    p.mass = 150;
    gWorld.addParticle(p);

    // Update the particle's position based on the coordinates
    p.position.x = posX;
    p.position.y = posY;

    return p;
  }

  createSpring(p1, p2, min = 1, max = 1, force = 0.4) {
    let spring = new c2.Spring(p1, p2, force);
    spring.length = dist(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
    spring.strength = force;

    spring.range(0.6 * spring.length, 50 * spring.length);
    gWorld.addSpring(spring);
    this.springs.push({ s: spring, f: force, l: spring.length });
  }

  draw() {
    fill(this.color);
    stroke(255);
    noStroke();

    // draw outline
    beginShape();
    for (let point of this.allPoints) {
      curveVertex(point.position.x, point.position.y);
      //circle(point.position.x, point.position.y, point.radius);
    }
    endShape(CLOSE);

    // stroke(255);
    // for (let s of this.springs) {
    //   line(s.s.p1.position.x, s.s.p1.position.y, s.s.p2.position.x, s.s.p2.position.y);
    // }
  }
}
