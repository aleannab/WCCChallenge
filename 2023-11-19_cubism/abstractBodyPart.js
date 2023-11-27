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