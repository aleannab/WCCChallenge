// Abstract classes for part and their subparts. Wire/Leg, Flower/Petal. These methods keep track of drawing each segment, one subpart at a time.

class AbstractPart {
  constructor() {
		if (new.target === AbstractPart) {
      throw new Error("Cannot instantiate abstract class AbstractPart.");
    }
    this.allSubpartsLeft = [];
    this.subpartsDone = [];
    this.setTranslations = function () {};
    this.isComplete = false;
  }

  grow() {
    //Draw all completed segments in full.
    for (let i = 0; i < this.subpartsDone.length; i++) {
      this.setTranslations();
      this.subpartsDone[i].drawSubpart();
      resetMatrix();
    }

    // Grow next segment, when it's done move into finished segments
    if (this.allSubpartsLeft.length > 0) {
      this.setTranslations();
      if (this.allSubpartsLeft[0].growSubpart()) {
        let finished = this.allSubpartsLeft.shift();
        this.subpartsDone.push(finished);
      }
      resetMatrix();
      return false;
    }

    this.isComplete = true;
    return true;
  }
}

class AbstractSubpart {
  constructor(rate) {
		if (new.target === AbstractSubpart) {
      throw new Error("Cannot instantiate abstract class AbstractSubpart.");
    }
    this.mainProgress = 0;
    this.mainRate = rate;
    this.isDone = false;
  }

  growSubpart() {
    if (this.mainProgress >= 1) {
      this.isDone = true;
    } else {
      this.drawSubpart();
      this.mainProgress += this.mainRate;
    }

    return this.isDone;
  }
  
  easeIn(start, end, factor) {
    return start + (end - start) * factor;
  }
}
