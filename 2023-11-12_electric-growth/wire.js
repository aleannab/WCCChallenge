// Wire connection between flower nodes

class Wire extends AbstractPart {
  constructor(startX, startY, isVertical) {
    super();

		// determine start and end positions of lines
    let px = startX;
    let py = startY;
    for (let i = 0; i < floor(random(6, 10)); i++) {
      let subpart = new Leg(px, py, isVertical);

      isVertical = !isVertical;
      px = subpart.endX;
      py = subpart.endY;
      this.allSubpartsLeft.push(subpart);
    }
    this.endX = px;
    this.endY = py;
  }
}

// single line of a wire part
class Leg extends AbstractSubpart{
  constructor(px, py, isVertical) {
    // TODO: update rate initation
    super(0.1);
		
    this.startX = px;
    this.startY = py;
    let isDiagonal = random(0, 1) < 0.3;
    
    let maxLength = isDiagonal ? 70 : 300;
    let length = random(50, maxLength); 
    if (random(0, 1) < 0.5) {
      length *= -1;
    }
		
    if (!isVertical){
      this.endX = isDiagonal ? px + length : px;
      this.endY = py + length;
    } else {
      this.endX = px + length;
      this.endY = isDiagonal ? py + length : py;
    }
		
		// check bounds
		// set bounds
		let widthBounds = 0.7 * (width / 2);
    let heightBounds = 0.7 * (height / 2); 
		if (this.endX < -widthBounds) this.endX = -widthBounds;
		if (this.endX > widthBounds) this.endX = widthBounds;
		if (this.endY < -heightBounds) this.endY = -heightBounds;
		if (this.endY > heightBounds) this.endY = heightBounds;
  }

  drawSubpart() {
    if (this.isDone) {
      line(this.startX, this.startY, this.endX, this.endY);
    } else {
      let xProgress = map(this.mainProgress, 0, 1.0, this.startX, this.endX, true);
      let yProgress = map(this.mainProgress, 0, 1.0, this.startY, this.endY, true);
      line(this.startX, this.startY, xProgress, yProgress);
    }
  }
}
