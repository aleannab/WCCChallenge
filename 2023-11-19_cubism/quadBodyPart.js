class QuadBodyPart extends BodyPart {
  constructor(pos, w, h, shouldRotate = false, angleMin = -1, angleMax = -1) {
    super(pos, w, h, angleMin, angleMax);

    let buffer = 10;
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
					}
				];

				this.bSketchLines.push(new SketchLine(linePoints));
			}
    }
  }

  drawPart(time) {
    push();
    translate(this.bPosition.x, this.bPosition.y);

    if (this.bRotate) {
      let angleRotation = map(
        sin(time + PI),
        -1,
        1,
        this.rotateMin,
        this.rotateMax
      );
      rotate(angleRotation);
    }

    noStroke();

    // draw main rect
    fill(this.bColor);
    quad(
      this.bPoints[0].x, this.bPoints[0].y,
      this.bPoints[1].x, this.bPoints[1].y,
      this.bPoints[2].x, this.bPoints[2].y,
      this.bPoints[3].x, this.bPoints[3].y
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