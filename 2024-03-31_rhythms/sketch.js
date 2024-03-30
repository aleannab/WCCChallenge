// Xolotl by Antoinette Bumatay-Chan

// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

const { Transport, Synth } = Tone;

let gCircleRadius = 500;
let gRadius;

let gRhythms = [];

let gPalette = ['#00b8b8', '#e4bd0b', '#de3d83'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  noStroke();

  gRadius = 0.5 * height;

  gRhythms.push(new Rhythm('C4', 4, '4n'));
  gRhythms.push(new Rhythm('A4', 3, '3n'));
  gRhythms.push(new Rhythm('E4', 7, '7n'));

  Transport.bpm.value = 60;
  Transport.start();
}

function draw() {
  blendMode(NORMAL);

  background(255);
  blendMode(MULTIPLY);

  push();
  translate(0.5 * width, 0.5 * height);
  // rotate(millis() * 0.0001);
  for (let beat of gRhythms) {
    beat.draw();
    beat.update();
  }
  pop();
}

function mousePressed() {
  Tone.start();
}

class Rhythm {
  constructor(note, beatCount, intervalStr) {
    this.synth = new Synth().toDestination();
    this.note = note;
    this.beatStr = intervalStr;
    this.beatInterval = Transport.toSeconds(this.beatStr);
    this.positions = this.setPositions(beatCount);
    this.curIndex = 0;
    this.targetIndex = 0;
    this.pos = this.positions[this.curIndex];
    this.color = random(gPalette);
    this.scheduleRhythm(this.beatStr);
    this.prevTime = -1;
  }

  update() {
    const next = this.timeUntilNextBeat();
    if (next > this.prevTime) {
      this.prevTime = next;
      const xp = map(next, 0, 1, this.positions[this.curIndex].x, this.positions[this.targetIndex].x);
      const yp = map(next, 0, 1, this.positions[this.curIndex].y, this.positions[this.targetIndex].y);
      this.pos = createVector(xp, yp);
    }
  }

  play(time) {
    this.synth.triggerAttackRelease(this.note, '8n', time);
    this.updateTargets();
  }

  draw() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, gCircleRadius);
  }

  timeUntilNextBeat() {
    const timeUntilNext = Transport.nextSubdivision(this.beatStr) - Transport.now();
    return constrain(map(timeUntilNext, 0, this.beatInterval, 1, 0), 0, 1);
  }

  setPositions(beatCount) {
    let angleInc = TWO_PI / beatCount;
    let positions = [];
    for (let i = 0; i < beatCount; i++) {
      let xp = gRadius * cos(i * angleInc);
      let yp = gRadius * sin(i * angleInc);
      positions.push(createVector(xp, yp));
    }

    return positions;
  }

  updateTargets() {
    this.curIndex = this.targetIndex;
    this.targetIndex = (this.targetIndex + 1) % this.positions.length;
    this.prevTime = -1;
  }

  scheduleRhythm(intervalStr) {
    Transport.scheduleRepeat((time) => {
      this.play(time);
    }, intervalStr);
  }
}
