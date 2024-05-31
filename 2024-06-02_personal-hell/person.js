let gAngularVScalar = 0.005;

// Max and min angles for body part rotation
let gOffsets = {
  upperBodyMin: 0,
  upperBodyMax: Math.PI / 10,
  headMin: Math.PI / 10,
  headMax: Math.PI / 4,
  hipMin: -Math.PI / 10,
  hipMax: Math.PI / 8,
  legMin: -Math.PI / 5,
  legMax: 0,
  ankleMin: 0,
  ankleMax: Math.PI / 4,
  figure: Math.PI / 8,
};

// Size scalars for body parts
let gPartSize = {
  head: { w: 1, h: 1.5 },
  torso: { w: 1, h: 2 },
  hips: { w: 1.2, h: 1 },
  thigh: { w: 0.8, h: 1.75 },
  ankle: { w: 0.6, h: 1.8 },
};

class Person {
  constructor(pos) {
    // Update body part sizes using unit scalars
    for (let part in gPartSize) {
      gPartSize[part].w *= gUnit;
      gPartSize[part].h *= gUnit;
    }
    this.pPosition = pos;
    this.initializeBodyParts();
    this.pVariance = random(0, 2 * PI); // offset for sinusoidal variation in Y position
  }

  initializeBodyParts() {
    this.pHead = new RoundBodyPart(
      { x: 0, y: -1.1 * gPartSize.torso.h },
      gPartSize.head.w,
      gPartSize.head.h,
      true,
      gOffsets.headMax,
      gOffsets.headMin
    );
    this.pTorso = new QuadBodyPart({ x: -0.5 * gPartSize.torso.w, y: -1.1 * gPartSize.torso.h }, gPartSize.torso.w, gPartSize.torso.h);
    this.pBothLegs = this.createLegs();
    this.pHips = new RoundBodyPart(
      { x: -0.01 * gPartSize.hips.w, y: 0.5 * gPartSize.hips.h },
      gPartSize.hips.w,
      gPartSize.hips.h,
      true,
      gOffsets.hipMin,
      gOffsets.hipMax
    );
  }

  createLegs() {
    let legs = [];
    for (let i = 0; i < 2; i++) {
      let thigh = new QuadBodyPart({ x: -0.5 * gPartSize.thigh.w, y: 0.05 * gPartSize.thigh.h }, gPartSize.thigh.w, gPartSize.thigh.h);
      let ankle = new QuadBodyPart(
        { x: -0.5 * gPartSize.ankle.w, y: 0.95 * gPartSize.thigh.h },
        gPartSize.ankle.w,
        gPartSize.ankle.h,
        true,
        gOffsets.ankleMin,
        gOffsets.ankleMax
      );
      let leg = new Leg(thigh, ankle);
      legs.push(leg);
    }
    return legs;
  }

  drawPerson(t) {
    push();
    // let yVar = 10 * sin(t + this.pVariance);
    translate(this.pPosition.x, this.pPosition.y);
    this.drawUpperBody(t);
    this.drawLowerBody(t);

    pop();
  }

  drawUpperBody(time) {
    push();

    rotate(map(sin(time), -1, 1, gOffsets.upperBodyMin, gOffsets.upperBodyMax));

    this.pTorso.drawPart();
    this.pHead.drawPart(time);

    pop();
  }

  drawLowerBody(time) {
    push();
    this.pBothLegs[0].drawPart(time);

    this.pHips.drawPart(time);
    this.pBothLegs[1].drawPart(time + PI);
    pop();
  }
}

class BodyPart {
  constructor(pos, w, h, angleMin, angleMax) {
    this.bPosition = pos;
    this.bWidth = w;
    this.bHeight = h;
    this.bIsRotate = false;
    this.rotateMin = angleMin;
    this.rotateMax = angleMax;
    this.bColor = random(gColorPalette);
    this.bPoints = [];
  }
}

class QuadBodyPart extends BodyPart {
  constructor(pos, w, h, shouldRotate = false, angleMin = -1, angleMax = -1) {
    super(pos, w, h, angleMin, angleMax);

    let offsets = getRandomValues(3, 10);
    let pt0 = { x: offsets[0], y: offsets[1] };
    let pt1 = { x: this.bWidth + offsets[2], y: offsets[0] };
    let pt2 = { x: this.bWidth + offsets[1], y: this.bHeight + offsets[2] };
    let pt3 = { x: -offsets[0], y: this.bHeight - offsets[1] };
    this.bRotate = shouldRotate;

    this.bPoints = [pt0, pt1, pt2, pt3];
    this.bSketchLines = [];

    let lineVariance = 10;
    for (let i = 0; i < 1; i++) {
      let offsets = getRandomValues(3, lineVariance);
      for (let i = 1; i < 4; i += 2) {
        let offsets = getRandomValues(3, lineVariance);
        let currentIndex = i;
        let nextIndex = (i + 1) % this.bPoints.length;
        let offsetIndex = 4 * i;

        let linePoints = [
          {
            x: this.bPoints[currentIndex].x + offsets[offsetIndex % offsets.length],
            y: this.bPoints[currentIndex].y + offsets[(offsetIndex + 1) % offsets.length],
          },
          {
            x: this.bPoints[nextIndex].x + offsets[(offsetIndex + 2) % offsets.length],
            y: this.bPoints[nextIndex].y + offsets[(offsetIndex + 3) % offsets.length],
          },
        ];

        this.bSketchLines.push(new SketchLine(linePoints));
      }
    }
  }

  drawPart(time) {
    push();
    translate(this.bPosition.x, this.bPosition.y);

    if (this.bRotate) {
      let angleRotation = map(sin(time + PI), -1, 1, this.rotateMin, this.rotateMax);
      rotate(angleRotation);
    }

    noStroke();

    // draw main rect
    fill(this.bColor);
    quad(
      this.bPoints[0].x,
      this.bPoints[0].y,
      this.bPoints[1].x,
      this.bPoints[1].y,
      this.bPoints[2].x,
      this.bPoints[2].y,
      this.bPoints[3].x,
      this.bPoints[3].y
    );

    // draw sketch outlines
    stroke(0);
    noFill();
    this.bSketchLines.forEach((line) => {
      line.drawSketchLine();
    });

    pop();
  }
}

class Leg {
  constructor(thigh, ankle) {
    this.thigh = thigh;
    this.ankle = ankle;
  }

  drawPart(time) {
    push();
    rotate(map(sin(time), -1, 1, gOffsets.legMin, gOffsets.legMax));
    this.thigh.drawPart(time);
    this.ankle.drawPart(time, true);
    pop();
  }
}

class RoundBodyPart extends BodyPart {
  constructor(pos, w, h, shouldRotate, angleMin = -1, angleMax = -1) {
    super(pos, w, h, angleMin, angleMax);
    this.isRotate = shouldRotate;

    let adjY = this.isRotate ? -this.bHeight / 2 : this.bPosition.y;
    this.randomSeed = random(0, 9999);

    this.sketch = new SingleCircle(pos.x, adjY, w, h, random(gColorPalette));
  }

  drawPart(time) {
    push();
    translate(this.bPosition.x, this.bPosition.y);

    if (this.isRotate) {
      translate(0, 0);
      let rotationAngle = map(sin(time), -1, 1, this.rotateMin, this.rotateMax);
      rotate(rotationAngle);
    }

    this.sketch.drawCircle();

    pop();
  }
}

class SingleCircle {
  constructor(bPosX, bPosY, bWidth, bHeight, col) {
    this.sketchCircles = [];
    this.sketchCircles.push(new SketchCircle(true, bPosX, bPosY, bWidth, bHeight, col));

    for (let i = 0; i < 2; i++) {
      this.sketchCircles.push(new SketchCircle(false, bPosX, bPosY, bWidth, bHeight));
    }
  }

  drawCircle() {
    this.sketchCircles.forEach((sketch) => {
      sketch.drawSketchCircle(time);
    });
  }
}

class SketchCircle {
  constructor(shouldFill, bPosX, bPosY, bWidth, bHeight, col) {
    this.isFilled = shouldFill;
    this.sWeight = random(0.5, 1);
    this.sColor = col;

    // Randomly adjusting control points
    let offsets = getRandomValues(4, 15);

    const baseX = bPosX - bWidth / 2;
    const baseY = bPosY;

    this.startPoint = { x: bPosX + bWidth / 2, y: baseY };
    this.sPoints0 = [
      { x: this.startPoint.x, y: baseY - bHeight * 0.6 + offsets[0] },
      { x: baseX + offsets[1], y: baseY - bHeight * 0.6 + offsets[2] },
      { x: baseX, y: baseY },
    ];

    this.sPoints1 = [
      { x: baseX, y: baseY + bHeight * 0.6 + offsets[3] },
      { x: this.startPoint.x, y: baseY + bHeight * 0.6 },
      { x: this.startPoint.x, y: baseY },
    ];
  }

  drawSketchCircle(time) {
    if (this.isFilled) {
      noStroke();
      fill(this.sColor);
    } else {
      strokeWeight(this.sWeight);
      stroke(0);
      noFill();
    }

    beginShape();
    vertex(this.startPoint.x, this.startPoint.y);

    bezierVertex(this.sPoints0[0].x, this.sPoints0[0].y, this.sPoints0[1].x, this.sPoints0[1].y, this.sPoints0[2].x, this.sPoints0[2].y);
    bezierVertex(this.sPoints1[0].x, this.sPoints1[0].y, this.sPoints1[1].x, this.sPoints1[1].y, this.sPoints1[2].x, this.sPoints1[2].y);

    endShape(CLOSE);
  }
}

class SketchLine {
  constructor(pts) {
    this.slPoints = pts;
    this.slWeight = random(0.5, 0.6);
  }

  drawSketchLine() {
    strokeWeight(this.slWeight);
    line(this.slPoints[0].x, this.slPoints[0].y, this.slPoints[1].x, this.slPoints[1].y);
  }
}
