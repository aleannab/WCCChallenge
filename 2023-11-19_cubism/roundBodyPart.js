class RoundBodyPart extends BodyPart {
  constructor(pos, w, h, shouldRotate, angleMin = -1, angleMax = -1) {
    super(pos, w, h, angleMin, angleMax);
    this.isRotate = shouldRotate;

    let adjY = this.isRotate ? -this.bHeight / 2 : this.bPosition.y;
    this.randomSeed = random(0, 9999);

    let offsets = getRandomValues(3, 10);

    this.sketchCircles = [];
    this.sketchCircles.push(new SketchCircle(true, pos.x, adjY, w, h));

    for (let i = 0; i < 2; i++) {
      this.sketchCircles.push(new SketchCircle(false, pos.x, adjY, w, h));
    }
  }

  drawPart(time) {
    push();
    translate(this.bPosition.x, this.bPosition.y);

    if (this.isRotate) {
      translate(0, 0);
      let rotationAngle = map(sin(time), -1, 1, this.rotateMin, this.rotateMax);
      rotate(rotationAngle);
    }
		
    this.sketchCircles.forEach((sketch) => {
      sketch.drawSketchCircle(time);
    });
		
    pop();
  }
}

class SketchCircle {
  constructor(shouldFill, bPosX, bPosY, bWidth, bHeight) {
    this.isFilled = shouldFill;
    this.sWeight = random(1.5, 2);
    this.sColor = random(gColorPalette);

    // Randomly adjusting control points
    let offsets = getRandomValues(4, 30);
		
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

    bezierVertex(
      this.sPoints0[0].x, this.sPoints0[0].y,
      this.sPoints0[1].x, this.sPoints0[1].y,
      this.sPoints0[2].x, this.sPoints0[2].y
    );
    bezierVertex(
      this.sPoints1[0].x, this.sPoints1[0].y,
      this.sPoints1[1].x, this.sPoints1[1].y,
      this.sPoints1[2].x, this.sPoints1[2].y
    );

    endShape(CLOSE);
  }
}

class SketchLine {
  constructor(pts) {
    this.slPoints = pts;
    this.slWeight = random(1, 2.5);
  }

  drawSketchLine() {
    strokeWeight(this.slWeight);
    line(
      this.slPoints[0].x, this.slPoints[0].y,
      this.slPoints[1].x, this.slPoints[1].y
    );
  }
}