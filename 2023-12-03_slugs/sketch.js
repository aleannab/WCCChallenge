// Created for the #WCCChallenge - Topic: Slugs
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gSlugs = [];

let gIsDebug = true;
let gBuffer = 500;
let resetTime = 0;

function setup() {
  // init sizes
  let length = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(windowWidth, windowHeight);
  gWorld = new c2.World(new c2.Rect(-gBuffer, -gBuffer, width + 2 * gBuffer, height + gBuffer));

  gSlugs.push(createSlug(0, height / 2));
}

function draw() {
  background(255);

  let time = 0.05 * (millis() - resetTime);

  let newX = -100 + time;
  gSlugs[0].head.position.x = -100 + time;
  gSlugs[0].head.position.y = height / 2 + 10 * sin(time * 0.1);

  if (newX > width + gBuffer) resetTime = millis();

  gWorld.update();

  gSlugs.forEach((slug) => {
    slug.draw();
  });
}

function createSlug(posX, posY) {
  return new Slug(new c2.Vector(posX, posY));
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

    this.createBody();
  }

  createBody() {
    let prevSegment = [];
    let prevTop = null;
    let posX = this.pos.x;
    let posY = this.pos.y;
    let lengthScalar = 1;
    for (let i = 0; i < this.segmentCount; i++) {
      let currentSegment = [];
      let currentHair = null;

      if (i === 0) {
        this.head = this.createParticle(posX, posY, true);
        currentSegment.push(this.head);
        this.drawPoints.push(this.head);
      } else {
        let top = this.createParticle(posX, posY - this.halfWidth);
        let mid = this.createParticle(posX, posY);
        this.drawPoints.push(mid);
        let bottom = this.createParticle(posX, posY + this.halfWidth);
        currentSegment.push.apply(currentSegment, [top, bottom]);
        this.createSpring(top, mid, lengthScalar);
        this.createSpring(mid, bottom, lengthScalar);
        this.createSpringsFromSegments(currentSegment, prevSegment, lengthScalar);

        if (i > 1) {
          let hair = this.createParticle(posX - this.width, posY - 2 * this.width);
          this.createSpring(top, hair);
          if (prevTop) {
            this.createSpring(prevTop, hair, 1);
          }
          prevTop = top;
        }
      }

      prevSegment = currentSegment;
      posX -= this.segmentLength;
    }
  }

  createParticle(posX, posY, isFixed = false) {
    let p = new c2.Particle(posX, posY);
    p.radius = 2;
    p.mass = 1; //p.radius;
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

  createSpring(p1, p2, force = 1.0) {
    let spring = new c2.Spring(p1, p2, force);
    spring.length = p1.position.distance(p2.position);
    gWorld.addSpring(spring);
    this.springs.push(spring);
  }

  draw() {
    noStroke();
    fill(0);
    let r = 10;
    let halfLength = floor(this.drawPoints.length / 2);
    let shouldAdd = true;
    for (let i = 0; i < this.drawPoints.length; i++) {
      let curPt = this.drawPoints[i];
      circle(curPt.position.x, curPt.position.y, r);
      r += 1 * (shouldAdd ? 1 : -1);
      if (i === halfLength) shouldAdd = false;
    }
    if (gIsDebug) {
      noFill();
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
