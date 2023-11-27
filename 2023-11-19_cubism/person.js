class Person {
  constructor(pos) {
    this.pPosition = pos;
    this.pOffsetTime = gOffsets.figure * random(1, 100);
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
    
    let yVar = 10 * sin(t + this.pVariance);
    translate(this.pPosition.x, this.pPosition.y + yVar);
    let time = t + this.pOffsetTime;
    this.drawUpperBody(time);
    this.drawLowerBody(time);
    pop();
  }

  update() {
    this.pPosition.x += gVelocityScalar * gIncX;
    this.pPosition.y += gVelocityScalar * gIncY;
    if (this.pPosition.x > 0.5 * width + gUnitX) {
      this.pPosition.x = gInitPosX;
      this.pPosition.y = gInitPosY;
      return true;
    }

    return false;
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