// Created for the #WCCChallenge - Topic: Slugs
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gSlugs = [];

function setup() {
  // init sizes
  let length = 0.9 * (windowWidth < windowHeight ? windowWidth : windowHeight);
  createCanvas(length, length);

  gWorld = new c2.World(new c2.Rect(0, 0, width, height));

  gSlugs.push(createSlug());
}

function draw() {
  background(255);

  gSlugs[0].points[0].position.x = mouseX;
  gSlugs[0].points[0].position.y = mouseY;

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
    this.width = 20;
    this.halfWidth = this.width / 2;
    this.segmentCount = 5;
    this.segmentLength = 5;
    this.points = [];
    this.springs = [];

    this.createBody();
  }

  createBody() {
    let currentPos = this.pos;
    for (let i = 0; i < this.segmentCount; i++) {
      let currentSegment = [];

      if (i > 0) {
        currentSegment.push(this.createParticle(currentPos.x, currentPos.y - this.halfWidth));
        currentSegment.push(this.createParticle(currentPos.x, currentPos.y + this.halfWidth));
        this.springs.push(this.createSpring(currentSegment[0], currentSegment[1]));

        let prevSegment = this.points.slice(this.points.length - 2, this.points.length);
        for (let curPt of currentSegment) {
          for (let prevPt of prevSegment) {
            this.springs.push(this.createSpring(curPt, prevPt));
          }
        }
      } else {
        currentSegment.push(this.createParticle(currentPos.x, currentPos.y));
      }
      this.points.push.apply(this.points, currentSegment);
      currentPos.x -= this.segmentLength;
    }

    this.points[0].fix();
  }

  createParticle(posX, posY) {
    let p = new c2.Particle(posX, posY);
    p.radius = 10;
    p.mass = p.radius;
    gWorld.addParticle(p);

    return p;
  }

  createSpring(p1, p2) {
    let spring = new c2.Spring(p1, p2, 0.1);
    spring.length = 1 * p1.position.distance(p2.position);
    gWorld.addSpring(spring);

    return spring;
  }

  draw() {
    for (let point of this.points) {
      circle(point.position.x, point.position.y, 10);
    }

    for (let spring of this.springs) {
      line(spring.p1.position.x, spring.p1.position.y, spring.p2.position.x, spring.p2.position.y);
    }
  }
}
