// Created for the #WCCChallenge - Topic: Slugs
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gSlugs = [];

let gIsDebug = false;

function setup() {
  // init sizes
  let length = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(windowWidth, windowHeight);

  gWorld = new c2.World(new c2.Rect(0, 0, width, height));

  gSlugs.push(createSlug());
}

function draw() {
  background(255);

  let time = 0.0005 * millis();
  stroke(0);
  noFill();
  circle(width / 2, height / 2, 400);

  gSlugs[0].head.position.x = mouseX; //200 * sin(time) + width / 2;
  gSlugs[0].head.position.y = mouseY; //200 * cos(time) + height / 2;

  gWorld.update();

  gSlugs.forEach((slug) => {
    slug.draw();
  });
}

function createSlug(posX, posY) {
  return new Slug(new c2.Vector(width / 2, height / 2));
}

class Slug {
  constructor(pos) {
    this.pos = pos;
    this.width = 25;
    this.halfWidth = this.width / 2;
    this.segmentCount = 15;
    this.segmentLength = 10;
    this.points = [];
    this.springs = [];
    this.head;

    this.createBody();
  }

  createBody() {
    let topHalf = [];
    let bottomHalf = [];
    let prevSegment = [];

    let shouldAdd = false;
    let everyVar = 3;
    for (let i = 0; i < this.segmentCount; i++) {
      let currentPos = new c2.Vector(this.pos.x - i * this.segmentLength, this.pos.y);
      let currentSegment = [];
      shouldAdd = i % everyVar === 0;

      if (i === 0) {
        this.head = this.createParticle(currentPos.x, currentPos.y, true);
        currentSegment.push(this.head);
      } else {
        let top = this.createParticle(currentPos.x, currentPos.y - this.halfWidth);
        if (shouldAdd) topHalf.push(top);
        let bottom = this.createParticle(currentPos.x, currentPos.y + this.halfWidth);
        if (shouldAdd) bottomHalf.push(bottom);
        currentSegment.push.apply(currentSegment, [top, bottom]);
        this.createSpring(currentSegment[0], currentSegment[1]);
        this.createSpringsFromSegments(currentSegment, prevSegment);
      }

      prevSegment = currentSegment;
    }

    this.points.push.apply(this.points, topHalf.reverse());
    this.points.push(this.head);
    this.points.push.apply(this.points, bottomHalf);
  }

  createParticle(posX, posY, isFixed = false) {
    let p = new c2.Particle(posX, posY);
    p.radius = 2;
    p.mass = 1; //p.radius;
    if (isFixed) p.fix();
    gWorld.addParticle(p);

    return p;
  }

  addSegment(pos) {}

  createSpringsFromSegments(currentSegment, prevSegment, forceWeight = 1.0) {
    for (let curPt of currentSegment) {
      for (let prevPt of prevSegment) {
        this.createSpring(curPt, prevPt, forceWeight);
      }
    }
  }

  createSpring(p1, p2, forceWeight = 1.0) {
    let spring = new c2.Spring(p1, p2, forceWeight);
    spring.length = p1.position.distance(p2.position);
    gWorld.addSpring(spring);
    this.springs.push(spring);
  }

  draw() {
    noStroke();
    fill(0);
    beginShape();
    let firstPt = this.points[0];
    let lastPt = this.points[this.points.length - 1];
    curveVertex(firstPt.position.x, firstPt.position.y);
    for (let i = 0; i < this.points.length; i++) {
      let curPt = this.points[i];
      curveVertex(curPt.position.x, curPt.position.y);
    }
    curveVertex(firstPt.position.x, firstPt.position.y);
    curveVertex(firstPt.position.x, firstPt.position.y);
    endShape();
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
