// Segment consists of wire (line) and a flower node at the end

class Segment {
  constructor(px, py, isVertical, quadrant, boundX, boundY) {
    // set start position
    this.startX = px;
    this.startY = py;

    // create wire
    this.wire = new Wire(px, py, isVertical, quadrant, boundX, boundY);
    this.endX = this.wire.endX;
    this.endY = this.wire.endY;

    // create flower at end point of wire
    this.flower = new Flower(this.endX, this.endY);

    // init variables
    this.isComplete = false;
    this.alphaVal = 255;
    this.alphaFinal = 255;
    this.flickeringOffset = random(0, TWO_PI);
  }

  drawSegment() {
    // vary alpha randomly to create flickering effect
    this.alphaFinal = this.alphaVal + 30 * sin(millis() / 10 + this.flickeringOffset);

    // animate segment growth, return true when finished
    if (this.wire.grow()) {
      if (this.flower.grow()) {
        this.alphaVal -= 0.5;
        return true;
      }
    }
    return false;
  }
}
