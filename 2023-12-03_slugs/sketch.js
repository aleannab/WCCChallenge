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

function setup() {
  // init sizes
  createCanvas(windowWidth, windowHeight);
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
  background(255);

  //if (!gIsDebug) {
  let time = millis() - gResetTime;
  if (time > 1000 && gSlugs.length < 50) {
    createSlug(random(500, width), -gBuffer / 2);
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
    this.segmentLength = this.width; //d random(25, 40);
    this.points = [];
    this.springs = [];
    this.circleSize = floor(random(5, 15));

    this.color = color(random(0, 255), random(0, 255), random(0, 255));

    this.createBody(this.segmentLength, this.segmentCount);
  }

  createBody(segLength, segCount) {
    let prevSegment = [];
    let posX = this.pos.x;
    let posY = this.pos.y;
    let lengthScalar = 1;

    let head;
    let topPts = [];
    let bottomPts = [];
    let end;

    for (let i = 0; i < segCount; i++) {
      let currentSegment = [];

      if (i === 0) {
        head = this.createParticle(posX, posY, true);
        currentSegment.push(head);
      } else if (i === segCount - 1) {
        end = this.createParticle(posX, posY + this.halfWidth, true);
        currentSegment.push(end);
        this.createSpringsFromSegments(currentSegment, prevSegment, lengthScalar);
      } else {
        let top = this.createParticle(posX, posY - this.halfWidth);
        topPts.push(top);
        let bottom = this.createParticle(posX, posY + this.halfWidth);
        bottomPts.push(bottom);
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

  createSpring(p1, p2, lengthScalar = 1, force = 0.3) {
    let spring = new c2.Spring(p1, p2, 0.5); //1);
    spring.length = lengthScalar * p1.position.distance(p2.position);
    spring.stiffness = 0.1; // Adjust stiffness value
    spring.damping = 1; // Adjust damping value
    gWorld.addSpring(spring);
    this.springs.push(spring);
  }

  draw() {
    noStroke();
    fill(this.color);
    for (let point of this.points) {
      circle(point.position.x, point.position.y, this.circleSize);
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
