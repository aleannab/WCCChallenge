// Flower node
class Flower extends AbstractPart {
  constructor(posX, posY) {
    super();
		
		// initialize petal variables
    this.petalCount = floor(random(3, 8));
    let petalMax = 1.5 * (360 / this.petalCount);
    this.petalHeight = floor(random(100, 300));
    this.petalWidth = floor(random(10, 2* petalMax));

		// set function to translate rotated petals back to flower node center
    this.setTranslations = function () {
      translate(posX, posY);
    };

    // create Petals
    let inc = 360 / this.petalCount;
    let rotationDirection = random(0,1) < 0.5 ? 1 : -1;
    let rotationFactor = rotationDirection * random(25, 50);
    for (let i = 0; i < this.petalCount; i++) {
      let petal = new Petal(this.petalWidth, this.petalHeight, i * inc, rotationFactor);
      this.allSubpartsLeft.push(petal);
    }
  }
  
  grow() {
    if (this.isComplete) {
			// when all petals are drawn, start growing the petal
      this.subpartsDone.forEach((petal) => {
        petal.isBlooming = true;
      });
    }
    return super.grow();
  }

}

class Petal extends AbstractSubpart {
  constructor(w, h, angle, r) {
    super(0.1); // rate at which petal grows
    this.pWidth = w;
    this.pHeight = h;
    this.pAngle = angle;
    this.pRotationFactor = r;

		// init variables
    this.currentWidth = 0;
    this.currentHeight = 0;
    this.bloomProgress = 0.1;
    this.bloomRate = 0.005;
    this.xBloomEase = 0.5;
    this.yBloomEase = 0.2;
    this.isBlooming = false;
		
		// init parameters for beginning of bloom
    this.bloom();
  }
  

  bloom() {
		// increase the width/height of petal gradually
    if (this.bloomProgress <= 1.0) {
      let xProgress = this.easeIn(this.bloomProgress, 1.0, this.xBloomEase);
      let yProgress = this.easeIn(this.bloomProgress, 1.0, this.yBloomEase);
      this.currentWidth = xProgress * this.pWidth;
      this.currentHeight = yProgress * this.pHeight;
      this.bloomProgress += this.bloomRate;
    }
  }

  drawSubpart() {
		// blooming has begun, grow petal shape
    if (this.isBlooming) this.bloom();
		
    // Translate to origin and rotate
    translate(0, 0);    
    rotate(radians(this.pAngle + millis() / this.pRotationFactor));

    // Draw the rotated bezier curve relative to the rotation center
    let start, end;
    start = end = { x: 0, y: 0 };
    let control1 = { x: this.currentWidth, y: this.currentHeight };
    let control2 = { x: -this.currentWidth, y: this.currentHeight };
		
    beginShape();

    vertex(0, 0);
    for (let i = 0; i <= this.mainProgress; i += 0.01) {
      let x = bezierPoint(start.x, control1.x, control2.x, end.x, i);
      let y = bezierPoint(start.y, control1.y, control2.y, end.y, i);
      vertex(x, y);
    }

    endShape();
		
    // Reset transformations
    resetMatrix();
  }
}
