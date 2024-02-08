// Created for the #WCCChallenge - Topic: Space Filling Algorithms
//
// I had a general idea of what I wanted to do when the topic was decided: fill the space with expanding blobs.
// I arrived at these pointy blobs unintentionally due to a bug with my springs.
// But I decided I liked them! They are reminiscent of Matisse's cutouts, so I kept going in that direction.
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gBlobs = [];
let gCountS = 3;
let gRadius;
let gCountX;
let gCountY;
let gIncX;
let gIncY;

let gDamping = 0.6;
let gFrequency = 0.01;
let gBgColor = '#f4f1ea';
let gBlobPalette = ['#3567af', '#c04e82', '#538e47', '#e88740', '#e25c43', '#016d6f'];

let gTime;

function setup() {
  createCanvas(windowWidth, windowHeight);
  gWorld = new c2.World(new c2.Rect(0, 0, width, height));

  let isWidthShort = width < height;
  let shortSide = isWidthShort ? width : height;
  let longSide = isWidthShort ? height : width;

  let incS = shortSide / gCountS;
  let countL = floor(longSide / incS);
  let incL = longSide / countL;

  gIncX = isWidthShort ? incS : incL;
  gCountX = isWidthShort ? gCountS : countL;

  gIncY = isWidthShort ? incL : incS;
  gCountY = isWidthShort ? countL : gCountS;
  gRadius = 0.1 * (gIncX + gIncY);

  addWorldForces();
  init();

  strokeWeight(5);
}

function mouseClicked() {
  init();
}

function draw() {
  background(gBgColor);

  gWorld.update();

  gBlobs.forEach((blob) => {
    blob.update();
    blob.draw();
  });
  gTime += 1;
}

function init() {
  clearForces();
  gBlobs = [];
  let isSmall = random() < 0.5;
  for (let i = 0; i < gCountX; i++) {
    for (let j = 0; j < gCountY; j++) {
      let s = isSmall ? random(0.7, 1) : random(1, 1.3);
      createBlob((i + 0.5) * gIncX, (j + 0.5) * gIncY, s);
      if (random() < 0.9) isSmall = !isSmall;
    }
  }
  gTime = 0;
}

function addWorldForces() {
  let quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height));
  let collision = new c2.Collision(quadTree);
  collision.iterations = 2;
  gWorld.addInteractionForce(collision);
}

function clearForces() {
  for (let s of gWorld.springs) {
    gWorld.removeSpring(s);
  }
  for (let p of gWorld.particles) {
    gWorld.removeParticle(p);
  }
  gWorld.springs = [];
  gWorld.particles = [];
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
    this.frequency = gFrequency;
    this.createBody(pos);
  }

  update() {
    const amplitude = 0.2 * this.radius;
    const timeFactor = min(gTime * this.frequency, 1);
    const expansionFactor = timeFactor * amplitude;

    for (let i = 0; i < this.allPoints.length; i++) {
      const point = this.allPoints[i];
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

    for (let i = 0; i < count; i++) {
      const angle = i * angInc;
      const x = this.radius * cos(angle) + pos.x;
      const y = this.radius * sin(angle) + pos.y;
      this.allPoints.push(this.createParticle(x, y));
    }

    for (let i = 0; i < count; i++) {
      const currentPoint = this.allPoints[i];
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
    beginShape();
    for (let point of this.allPoints) {
      curveVertex(point.position.x, point.position.y);
    }
    stroke(this.color);
    fill(this.color);
    endShape(CLOSE);
  }
}
