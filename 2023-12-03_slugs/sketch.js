// Created for the #WCCChallenge - Topic: Slugs
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gSlugs = [];

let gIsDebug = true;
let gBuffer = 50;
let resetTime = 0;

function setup() {
  // init sizes
  let length = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(windowWidth, windowHeight);
  gWorld = new c2.World(new c2.Rect(-gBuffer, -gBuffer, width + 2 * gBuffer, height + gBuffer));

  createSlug(random(100, width), -20);

  quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height));
  let collision = new c2.Collision(quadTree);
  //collision.iteration = 2;
  gWorld.addInteractionForce(collision);

  let constForce = new c2.ConstForce(0, 3);
  gWorld.addForce(constForce);
}

function draw() {
  background(255);

  let time = millis() - resetTime;
  if (time > 5000) {
    createSlug(random(0, width), -gBuffer / 2);
    resetTime = millis();
  }
  gWorld.update();

  gSlugs.forEach((slug) => {
    slug.draw();
  });
}

function createSlug(posX, posY) {
  gSlugs.push(new Slug(new c2.Vector(posX, posY)));
}

function keyPressed() {
  if (key == 'd') {
    gIsDebug = !gIsDebug;
  }
}

class Slug {
  constructor(pos) {
    this.pos = pos;
    this.width = 25;
    this.halfWidth = this.width / 2;
    this.segmentCount = 10;
    this.segmentLength = 20;
    this.points = [];
    this.drawPoints = [];
    this.springs = [];
    this.head;

    this.color = color(random(0, 255), random(0, 255), random(0, 255));

    this.createBody(20, 10);
  }

  createBody(segLength, segCount) {
    let prevSegment = [];
    let posX = this.pos.x;
    let posY = this.pos.y;
    let lengthScalar = 1;
    for (let i = 0; i < segCount; i++) {
      let currentSegment = [];

      if (i === 0) {
        this.head = this.createParticle(posX, posY, true);
        currentSegment.push(this.head);
        this.drawPoints.push(this.head);
      } else {
        let top = this.createParticle(posX, posY - this.halfWidth);
        let bottom = this.createParticle(posX, posY + this.halfWidth);
        currentSegment.push.apply(currentSegment, [top, bottom]);
        this.createSpring(top, bottom, lengthScalar);
        this.createSpringsFromSegments(currentSegment, prevSegment, lengthScalar);
      }

      prevSegment = currentSegment;
      posX -= segLength;
    }
  }

  createParticle(posX, posY, isFixed = false) {
    let p = new c2.Particle(posX, posY);
    p.radius = 8;
    p.mass = p.radius;
    if (isFixed) p.fix();
    gWorld.addParticle(p);
    this.points.push(p);

    return p;
  }

  addSegment(pos) {}

  createSpringsFromSegments(currentSegment, prevSegment, lengthScalar = 1.0) {
    for (let curPt of currentSegment) {
      for (let prevPt of prevSegment) {
        this.createSpring(curPt, prevPt, lengthScalar);
      }
    }
  }

  createSpring(p1, p2, lengthScalar = 1, force = 0.5) {
    let spring = new c2.Spring(p1, p2, force);
    spring.length = lengthScalar * p1.position.distance(p2.position);
    gWorld.addSpring(spring);
    this.springs.push(spring);
  }

  draw() {
    noStroke();
    fill(this.color);
    let r = 20;
    let halfLength = floor(this.drawPoints.length / 2);
    let shouldAdd = true;
    for (let i = 1; i < this.drawPoints.length; i++) {
      let curPt = this.drawPoints[i];
      circle(curPt.position.x, curPt.position.y, r);
      r += 5 * (shouldAdd ? 1 : -1);
      if (i === halfLength) shouldAdd = false;
    }

    if (gIsDebug) {
      noFill();
      strokeWeight(1);
      stroke(255, 0, 0, 255);
      for (let point of this.points) {
        circle(point.position.x, point.position.y, 5);
      }

      for (let spring of this.springs) {
        line(spring.p1.position.x, spring.p1.position.y, spring.p2.position.x, spring.p2.position.y);
      }
    }
  }
}
