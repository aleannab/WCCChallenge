// Xolotl by Antoinette Bumatay-Chan

// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

const { Transport, Synth } = Tone;

let gCircleRadius = 500;
let gRadius;

let gRhythms = [];

let gAllChords = [
  ['A', 'C', 'E'],
  ['B', 'D', 'F'],
  ['G', 'B', 'D'],
];
let gOctaves = ['3', '4']; //, '5']; //'3', '4', '5'];
let gCounts = [2, 3, 4, 5, 6, 7];

let gPalette = ['#00b8b8', '#e4bd0b', '#de3d83'];

let gIsPlaying = false;

function setup() {
  const l = windowWidth < windowHeight ? windowWidth : windowHeight;
  createCanvas(l, l);
  background(255);
  noStroke();

  gRadius = 0.5 * height;

  Transport.bpm.value = 60;
}

function createPolyRhythm() {
  Transport.stop();
  Transport.cancel(0);
  gRhythms = [];
  gCounts = shuffle(gCounts);
  gPalette = shuffle(gPalette);
  let chord = random(gAllChords);

  let num = floor(random(3)) + 1;
  for (let i = 0; i < num; i++) {
    let count = gCounts[i % gCounts.length];
    let note = chord[i % chord.length] + random(gOctaves);
    let interval = str(count) + 'n';
    gRhythms.push(new Rhythm(i, note, count, interval));
  }
  Transport.start();
}

function draw() {
  blendMode(BLEND);

  background(255);
  blendMode(MULTIPLY);

  push();
  translate(0.5 * width, 0.5 * height);
  rotate(millis() * 0.0001);
  for (let beat of gRhythms) {
    beat.draw();
    beat.update();
  }
  pop();
}

function mousePressed() {
  if (!gIsPlaying) {
    gIsPlaying = true;
    // Tone.start();
  }
  createPolyRhythm();
}

class Rhythm {
  constructor(index, note, beatCount, intervalStr) {
    this.synth = new Synth().toDestination();
    this.note = note;
    this.beatStr = intervalStr;
    this.beatInterval = Transport.toSeconds(this.beatStr);
    this.positions = this.setPositions(beatCount, (index + 1) * 0.1 * height);
    this.curIndex = 0;
    this.targetIndex = 0;
    this.pos = this.positions[this.curIndex];
    this.color = color(gPalette[index % gPalette.length]);
    this.scheduleRhythm(this.beatStr);
    this.prevTime = -1;
    this.radius = random(0.15, 0.25) * height;
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
    this.synth.triggerAttackRelease(this.note, '16n', time);
    this.updateTargets();
  }

  draw() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.radius);
  }

  timeUntilNextBeat() {
    const timeUntilNext = Transport.nextSubdivision(this.beatStr) - Transport.now();
    return constrain(map(timeUntilNext, 0, this.beatInterval, 1, 0), 0, 1);
  }

  setPositions(beatCount, r) {
    let angleInc = TWO_PI / beatCount;
    let positions = [];
    for (let i = 0; i < beatCount; i++) {
      let xp = r * cos(i * angleInc);
      let yp = r * sin(i * angleInc);
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
