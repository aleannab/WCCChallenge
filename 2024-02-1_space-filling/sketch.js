// Created for the #WCCChallenge - Topic: Space Filling
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gBlobs = [];
let gCountX = 3;
let gCountY = 3;

let gRadius;

let gDamping = 0.6;
let gFrequency = 0.02;

let gBgColor = '#f4f1ea';
let gBlobPalette = ['#3567af', '#c04e82', '#538e47', '#e88740', '#e25c43', '#016d6f'];

function setup() {
  let l = windowWidth < windowHeight ? windowWidth : windowHeight;
  createCanvas(l, l);
  console.log('length: ' + l);
  gWorld = new c2.World(new c2.Rect(0, 0, width, height));

  let incX = width / gCountX;
  let incY = height / gCountY;
  gRadius = 0.2 * min(incX, incY);

  let isSmall = random() < 0.5;
  for (let i = 0; i < gCountX; i++) {
    for (let j = 0; j < gCountY; j++) {
      let s = isSmall ? random(0.7, 1) : random(1, 1.3);
      createBlob((i + 0.5) * incX, (j + 0.5) * incY, s);
      isSmall = !isSmall;
    }
  }

  addWorldForces();
}

function draw() {
  background(gBgColor);

  gWorld.update();

  gBlobs.forEach((blob) => {
    blob.update();
    blob.draw();
  });
  //console.log(frameRate());
}

function addWorldForces() {
  quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height));
  let collision = new c2.Collision(quadTree);
  collision.iterations = 10;
  gWorld.addInteractionForce(collision);
}

function createBlob(posX, posY, scalar) {
  gBlobs.push(new Blob(new c2.Vector(posX, posY), scalar));
}

class Blob {
  constructor(pos, scalar) {
    this.allPoints = [];
    this.springs = [];
    this.color = random(gBlobPalette);
    this.radius = gRadius * scalar;

    this.frequency = gFrequency; // * map(scalar, 0.5, 1.5, 1, 0.7);

    this.createBody(pos);
  }

  update() {
    const amplitude = 0.2 * this.radius;
    for (let i = 0; i < this.allPoints.length; i++) {
      const point = this.allPoints[i];

      const timeFactor = min(frameCount * this.frequency, 1);

      const expansionFactor = timeFactor * amplitude;

      point.radius = 1.5 * expansionFactor;

      for (let j = 0; j < this.springs.length; j++) {
        const spring = this.springs[j];
        spring.s.length = spring.l * expansionFactor * gDamping;
      }
    }
  }

  createBody(pos) {
    const count = floor(this.radius);
    const angInc = TWO_PI / count;

    // Create particles
    for (let i = 0; i < count; i++) {
      const angle = i * angInc;
      const x = this.radius * cos(angle) + pos.x;
      const y = this.radius * sin(angle) + pos.y;
      this.allPoints.push(this.createParticle(x, y));
    }

    // Connect to the next neighbor
    for (let i = 0; i < count; i++) {
      const currentPoint = this.allPoints[i];

      // Connect to the next neighbor
      const nextIndex = (i + 1) % count;
      const nextPoint = this.allPoints[nextIndex];
      this.createSpring(currentPoint, nextPoint);
    }
  }

  createParticle(posX, posY) {
    let p = new c2.Particle(posX, posY);
    gWorld.addParticle(p);

    return p;
  }

  createSpring(p1, p2) {
    let spring = new c2.Spring(p1, p2);
    spring.length = dist(p1.position.x, p1.position.y, p2.position.x, p2.position.y);

    spring.range(0.6 * spring.length, 50 * spring.length);
    gWorld.addSpring(spring);
    this.springs.push({ s: spring, l: spring.length });
  }

  draw() {
    noStroke();

    // draw outline
    beginShape();
    for (let point of this.allPoints) {
      curveVertex(point.position.x, point.position.y);
      fill(0);
      //circle(point.position.x, point.position.y, point.radius);
    }
    fill(this.color);
    endShape(CLOSE);

    // stroke(255);
    // for (let s of this.springs) {
    //   line(s.s.p1.position.x, s.s.p1.position.y, s.s.p2.position.x, s.s.p2.position.y);
    // }
  }
}
