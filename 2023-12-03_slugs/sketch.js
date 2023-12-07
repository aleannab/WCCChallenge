// Created for the #WCCChallenge - Topic: Slugs
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gSlugs = [];

let gIsDebug = false;
let gBuffer = 50;
let gResetTime = 0;

let gBgColor = '#09090b';
let gSlugPalette = ['#79b7ba', '#9f1fde', '#fb6a0c', '#8de28e', '#e3dee6'];
let gCircleSizes = [9, 12, 15];

function setup() {
  // init sizes
  let scalar = 0.9;
  createCanvas(scalar * windowWidth, scalar * windowHeight);
  gWorld = new c2.World(new c2.Rect(0, -gBuffer, width, height + gBuffer));

  if (gIsDebug) {
    createSlug(width / 2, height / 2);
  } else {
    createSlug(random(100, width), -20);
  }

  quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height));
  let collision = new c2.Collision(quadTree);
  collision.iterations = 5;
  gWorld.addInteractionForce(collision);

  let constForce = new c2.ConstForce(0, 1);
  gWorld.addForce(constForce);
}

function draw() {
  background(gBgColor);

  //if (!gIsDebug) {
  let time = millis() - gResetTime;
  if (time > 1000 && gSlugs.length < 100) {
    createSlug(random(0, width), -gBuffer / 2);
    gResetTime = millis();
  }
  gWorld.update();
  //}

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
    this.width = random(15, 25);
    this.halfWidth = this.width / 2;
    this.segmentCount = floor(random(5, 10));
    this.segmentLength = random(0.8, 1.2) * this.width;
    this.points = [];
    this.springs = [];
    this.circleSize = random(gCircleSizes);
    this.mass = random(1, 5);
    this.isDots = false; //random(0, 1) > 0.5;

    this.color = random(gSlugPalette);

    this.createBody(this.segmentLength, this.segmentCount);
  }

  createBody(segLength, segCount) {
    let prevSegment = [];
    let posX = this.pos.x;
    let posY = this.pos.y;
    let lengthScalar = 1;

    for (let i = 0; i < segCount; i++) {
      let currentSegment = [];

      if (i === 0) {
        currentSegment.push(this.createParticle(posX, posY, true));
      } else if (i === segCount - 1) {
        currentSegment.push(this.createParticle(posX, posY, false));
        this.createSpringsFromSegments(currentSegment, prevSegment, lengthScalar);
      } else {
        let top = this.createParticle(posX, posY - this.halfWidth);
        let bottom = this.createParticle(posX, posY + this.halfWidth);
        currentSegment.push.apply(currentSegment, [top, bottom]);
        this.createSpring(top, bottom, lengthScalar, 1);
        this.createSpringsFromSegments(currentSegment, prevSegment, lengthScalar);
      }
      prevSegment = currentSegment;
      posX -= segLength;
    }
  }

  createParticle(posX, posY, isFixed = false) {
    let p = new c2.Particle(posX, posY);
    p.radius = 10;
    p.mass = random(0.9, 1.1) * this.mass; //random(1, 5); //1; //p.radius;
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

  createSpring(p1, p2, lengthScalar = 1, force = 0.3) {
    let spring = new c2.Spring(p1, p2, 0.5); //1);
    spring.length = lengthScalar * p1.position.distance(p2.position);
    spring.stiffness = 0.1; // Adjust stiffness value
    spring.damping = 1; // Adjust damping value
    gWorld.addSpring(spring);
    this.springs.push(spring);
  }

  draw() {
    //if (this.isDots) {
    noStroke();
    fill(this.color);
    for (let point of this.points) {
      circle(point.position.x, point.position.y, this.circleSize);
    }
    //} else {
    noFill();
    stroke(this.color);
    strokeWeight(1);
    beginShape();
    let first = this.points[0];
    let last = this.points[this.points.length - 1];
    curveVertex(first.position.x, first.position.y);
    for (let point of this.points) {
      curveVertex(point.position.x, point.position.y);
    }
    curveVertex(last.position.x, last.position.y);
    endShape();
    //}

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
