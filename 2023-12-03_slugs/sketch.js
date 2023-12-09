// Created for the #WCCChallenge - Topic: Slugs
//
// Uses the c2.js library for physics simulations: https://github.com/ren-yuan/c2.js/tree/main
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

let gWorld;
let gSlugs = [];

let gIsDebug = false;
let gBuffer = 200;
let gResetTime = 0;

let gBgColor = '#09090b';
let gSlugPalette = ['#79b7ba', '#9f1fde', '#fb6a0c', '#8de28e', '#e3dee6'];
let gCircleSizes = [9, 12, 15];

function setup() {
  randomSeed(1);
  // init sizes
  let scalar = 0.9;
  createCanvas(scalar * windowWidth, scalar * windowHeight);
  gWorld = new c2.World(new c2.Rect(0, -gBuffer, width, height + gBuffer));

  if (gIsDebug) {
    createSlug(width / 2, height / 2);
  } else {
    createSlug(random(100, width), -20);
    let constForce = new c2.ConstForce(0, 1);
    gWorld.addForce(constForce);
  }

  quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height));
  let collision = new c2.Collision(quadTree);
  collision.iterations = 5;
  gWorld.addInteractionForce(collision);
}

function draw() {
  background(gBgColor);

  if (!gIsDebug) {
    let lastSlug = gSlugs[gSlugs.length - 1];

    if (lastSlug.allSegments[0].points[0].position.y > 25) {
      let time = millis() - gResetTime;
      if (time > 1500 && gSlugs.length < 100) {
        createSlug(random(gBuffer, width), -30);
        gResetTime = millis();
      }
    } else {
      console.log('ALL DONE');
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
    this.initPos = pos;
    this.allSegments = [];
    this.headSegment;
    this.tailSegment;

    this.springs = [];
    this.mass = random(1, 5);

    this.color = random(gSlugPalette);

    let segmentCount = floor(random(5, 8));
    let segmentHeight = random(15, 25);
    let segmentLength = segmentHeight;

    this.createBody(segmentLength, segmentHeight, segmentCount);

    this.lineCount = random(2, 5);
  }

  createBody(segLength, segHeight, segCount) {
    let posX = this.initPos.x;
    let posY = this.initPos.y;

    let halfHeight = segHeight / 2;

    let head = this.createParticle(posX, posY - halfHeight, false);
    this.headSegment = new SlugSegment([head]);
    this.allSegments.push(this.headSegment);

    let prevSeg = this.headSegment;
    posX -= 0.5 * segLength;

    for (let i = 0; i < segCount; i++) {
      let tailAdj = i === segCount - 1 ? 0.5 : 1;
      let top = this.createParticle(posX, posY - tailAdj * (1 + segHeight));
      let bottom = this.createParticle(posX, posY);
      let currentSeg = new SlugSegment([top, bottom]);
      this.createSpring(currentSeg.points[0], currentSeg.points[1]);
      this.createSpringsFromSegments(currentSeg, prevSeg);
      this.allSegments.push(currentSeg);
      posX -= segLength;
      prevSeg = currentSeg;
    }

    let tail = this.createParticle(posX, posY, false);
    this.tailSegment = new SlugSegment([tail]);
    this.createSpringsFromSegments(this.tailSegment, prevSeg);
    this.allSegments.push(this.tailSegment);

    let topPoints = [];
    let bottomPoints = [];
    for (let seg of this.allSegments) {
      topPoints.push(seg.points[0]);
      if (seg.points.length > 1) bottomPoints.push(seg.points[1]);
    }
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

    return p;
  }

  createSpringsFromSegments(currentSeg, prevSeg) {
    for (let curPt of currentSeg.points) {
      for (let prevPt of prevSeg.points) {
        this.createSpring(curPt, prevPt);
      }
    }
  }

  createSpring(p1, p2, min = 1, max = 1, force = 0.4) {
    let spring = new c2.Spring(p1, p2, force);
    spring.length = dist(p1.position.x, p1.position.y, p2.position.x, p2.position.y);

    spring.range(0.6 * spring.length, 5 * spring.length);
    gWorld.addSpring(spring);
    this.springs.push(spring);
  }

  draw() {
    noFill();
    stroke(this.color);
    strokeWeight(1);
    beginShape();
    for (let point of this.drawPoints) {
      curveVertex(point.position.x, point.position.y);
    }
    endShape(CLOSE);
    for (let i = 0; i < this.lineCount + 1; i++) {
      let percentage = map(i, 0, this.lineCount, 0, 1.0);
      beginShape();
      curveVertex(this.headSegment.points[0].position.x, this.headSegment.points[0].position.y);
      for (let segment of this.allSegments) {
        let pY =
          segment.points.length === 1
            ? segment.points[0].position.y
            : map(percentage, 0, 1, segment.points[0].position.y, segment.points[1].position.y, true);
        curveVertex(segment.points[0].position.x, pY);
      }
      curveVertex(this.tailSegment.points[0].position.x, this.tailSegment.points[0].position.y);
      endShape();
    }

    if (gIsDebug) {
      noFill();
      strokeWeight(1);
      stroke(255, 0, 0, 255);
      // for (let point of this.points) {
      //   circle(point.position.x, point.position.y, 1);
      // }
      for (let seg of this.allSegments) {
        seg.drawPoints();
      }
      for (let spring of this.springs) {
        line(spring.p1.position.x, spring.p1.position.y, spring.p2.position.x, spring.p2.position.y);
      }
    }
  }
}

class SlugSegment {
  constructor(points) {
    this.points = points;
  }

  drawPoints() {
    for (let point of this.points) {
      circle(point.position.x, point.position.y, 1);
    }
  }
}
