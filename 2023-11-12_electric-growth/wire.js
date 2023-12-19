// Wire connection between flower nodes

class Wire extends AbstractPart {
  constructor(startX, startY, isVertical, quadrant, widthBounds, heightBounds) {
    super();
    let directionVal;

    switch (quadrant) {
      case 0:
        directionVal = createVector(0, 1);
        break;
      case 1:
        directionVal = createVector(0, -1);
        break;
      case 2:
        directionVal = createVector(-1, 0);
        break;
      case 3:
        directionVal = createVector(1, 0);
        break;
    }

    // determine start and end positions of lines
    let start = createVector(startX, startY);
    let py = start.y;
    let px = start.x;

    let legNum = floor(random(6, 10));
    for (let i = 0; i < legNum; i++) {
      let isDiagonal = random(0, 1) < 0.2;
      let maxLength = isDiagonal ? 100 : 500;

      let maxLengthX = isVertical ? maxLength / 2 : maxLength;
      let maxLengthY = isVertical ? maxLength : maxLength / 2;
      let newX = px;
      let newY = py;
      if (isDiagonal) {
        let inc = maxLength;
        newX += this.getRandDirectionScalar() * inc;
        newY += this.getRandDirectionScalar() * inc;
      } else if (isVertical) {
        let incY = directionVal.y === 0 ? this.getRandDirectionScalar() : directionVal.y;
        newY += incY * random(maxLengthY / 2, maxLengthY);
        isVertical = false;
      } else {
        let incX = directionVal.x === 0 ? this.getRandDirectionScalar() : directionVal.x;
        newX += incX * random(maxLengthX / 2, maxLengthX);
        isVertical = true;
      }

      // check bounds
      // set bounds
      let randVal = random(50, 300);
      if (newX < widthBounds.min) newX = px + randVal;
      if (newX > widthBounds.max) newX = px - randVal;
      if (newY < heightBounds.min) newY = py + randVal;
      if (newY > heightBounds.max) newY = py - randVal;
      let subpart = new Leg(createVector(px, py), createVector(newX, newY));

      px = newX;
      py = newY;

      this.allSubpartsLeft.push(subpart);
    }
    this.endX = px;
    this.endY = py;
  }

  getRandDirectionScalar() {
    return random(0, 1) < 0.5 ? -1 : 1;
  }
}

// single line of a wire part
class Leg extends AbstractSubpart {
  constructor(startPoint, endPoint) {
    // TODO: update rate initation
    super(0.1);

    this.start = startPoint;
    this.end = endPoint;
  }

  drawSubpart() {
    if (this.isDone) {
      line(this.start.x, this.start.y, this.end.x, this.end.y);
    } else {
      let xProgress = map(this.mainProgress, 0, 1.0, this.start.x, this.end.x, true);
      let yProgress = map(this.mainProgress, 0, 1.0, this.start.y, this.end.y, true);
      line(this.start.x, this.start.y, xProgress, yProgress);
    }
  }
}
