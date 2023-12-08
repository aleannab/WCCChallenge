// Created for the #WCCChallenge - Topic: Slugs
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gSlugs = [];

let gIsDebug = true;
let gBuffer = 200;
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

  if (!gIsDebug) {
    let time = millis() - gResetTime;
    if (time > 1500 && gSlugs.length < 100) {
      createSlug(random(gBuffer, width), -30);
      gResetTime = millis();
    }
    gWorld.update();
  }

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
    this.drawPoints = [];
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

    // let slugPoints = [];
    // slugPoints.push(this.createParticle(posX, posY)); // 0
    // slugPoints.push(this.createParticle(posX + 30, posY)); //1
    // slugPoints.push(this.createParticle(posX + 60, posY)); //2
    // slugPoints.push(this.createParticle(posX + 80, posY)); //3
    // slugPoints.push(this.createParticle(posX + 90, posY - 10)); //4
    // slugPoints.push(this.createParticle(posX + 80, posY - 15)); //5
    // slugPoints.push(this.createParticle(posX + 60, posY - 10)); //6
    // slugPoints.push(this.createParticle(posX + 40, posY - 20)); //7
    // slugPoints.push(this.createParticle(posX + 30, posY - 15)); //8

    // // for (let i = 0; i < slugPoints.length; i++) {
    // //   for (let j = 0; j < slugPoints.length; j++) {
    // //     if (i === j) continue;
    // //     this.createSpring(slugPoints[i], slugPoints[j]);
    // //   }
    // // }
    // for (let i = 1; i < slugPoints.length; i++) {
    //   this.createSpring(slugPoints[i], slugPoints[i - 1]);
    // }
    // this.createSpring(slugPoints[0], slugPoints[4]);
    // this.createSpring(slugPoints[0], slugPoints[6]);
    // this.createSpring(slugPoints[0], slugPoints[8]);
    // this.createSpring(slugPoints[1], slugPoints[3]);
    // this.createSpring(slugPoints[1], slugPoints[6]);
    // this.createSpring(slugPoints[1], slugPoints[7]);
    // this.createSpring(slugPoints[1], slugPoints[8]);
    // this.createSpring(slugPoints[2], slugPoints[5]);
    // this.createSpring(slugPoints[2], slugPoints[6]);
    // this.createSpring(slugPoints[2], slugPoints[7]);
    // this.createSpring(slugPoints[2], slugPoints[8]);
    // this.createSpring(slugPoints[3], slugPoints[5]);
    // this.createSpring(slugPoints[3], slugPoints[6]);
    // this.createSpring(slugPoints[5], slugPoints[7]);

    // this.drawPoints = this.points;

    let head;
    let topPoints = [];
    let bottomPoints = [];
    let tail;

    for (let i = 0; i < segCount; i++) {
      let currentSegment = [];

      if (i === 0) {
        head = this.createParticle(posX, posY, false);
        currentSegment.push(head);
      } else if (i === segCount - 1) {
        tail = this.createParticle(posX, posY, false);
        currentSegment.push(tail);
        this.createSpringsFromSegments(currentSegment, prevSegment);
      } else {
        let top = this.createParticle(posX, posY - this.halfWidth);
        topPoints.push(top);
        let bottom = this.createParticle(posX, posY + this.halfWidth);
        bottomPoints.push(bottom);
        currentSegment.push.apply(currentSegment, [top, bottom]);
        this.createSpring(top, bottom, 1, 1.2);
        this.createSpringsFromSegments(currentSegment, prevSegment);
      }
      prevSegment = currentSegment;
      posX -= segLength;
    }
    this.createSpring(head, tail, 0.8, 1.5);

    this.drawPoints = [tail, ...topPoints.reverse(), head, ...bottomPoints];
  }

  createParticle(posX, posY, isFixed = false) {
    let offsetX = 0; // random(-0.2, 0.2) * this.width;
    let offsetY = 0; //random(-0.2, 0.2) * this.segmentLength;
    let p = new c2.Particle(posX + offsetX, posY + offsetY);
    p.radius = 10;
    p.mass = random(0.9, 1.1) * this.mass; //random(1, 5); //1; //p.radius;
    if (isFixed) p.fix();
    gWorld.addParticle(p);
    this.points.push(p);

    return p;
  }

  addSegment(pos) {}

  createSpringsFromSegments(currentSegment, prevSegment) {
    for (let curPt of currentSegment) {
      for (let prevPt of prevSegment) {
        this.createSpring(curPt, prevPt);
      }
    }
  }

  createSpring(p1, p2, min = 1, max = 1, force = 0.3) {
    let spring = new c2.Spring(p1, p2, force);
    spring.length = dist(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
    console.log(spring.length);
    spring.range(0.5 * spring.length, 5 * spring.length);
    gWorld.addSpring(spring);
    this.springs.push(spring);
  }

  draw() {
    //if (this.isDots) {
    noStroke();
    fill(this.color);
    for (let point of this.points) {
      circle(point.position.x, point.position.y, 2); //this.circleSize);
    }
    //} else {
    noFill();
    stroke(this.color);
    strokeWeight(1);
    beginShape();
    for (let point of this.drawPoints) {
      curveVertex(point.position.x, point.position.y);
    }

    endShape(CLOSE);
    //}

    if (gIsDebug) {
      noFill();
      strokeWeight(1);
      stroke(255, 0, 0, 255);
      for (let point of this.points) {
        circle(point.position.x, point.position.y, 1);
      }
      for (let spring of this.springs) {
        line(spring.p1.position.x, spring.p1.position.y, spring.p2.position.x, spring.p2.position.y);
      }
    }
  }
}
