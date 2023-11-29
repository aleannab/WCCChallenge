let gWorld;

let colorPalette = ['#4466ff', '#aa33ff', '#ee0000', '#008800', '#dd1188'];

let gRowPadding = 50;
let gColPadding = 10;
let gRowCount;
let gColCount;
let gParticles = [];

let gCircleColor;
let gCircleDiameter;

let gHomeForce = 10;
let gMouseForce = -30;

function setup() {
  // init sizes
  let length = windowWidth < windowHeight ? windowWidth : windowHeight;
  createCanvas(length, length);
  colorMode(HSL, 360, 100, 100);
  gCircleDiameter = 0.6 * length;

  gWorld = new c2.World(new c2.Rect(0, 0, width, height));
  createWeb();

  // init line/fill parameters
  strokeWeight(20);
  setRandomCircleColor();
}

function draw() {
  background(255);

  drawCircle();

  // repels lines away from mouse if there's movement
  applyMouseForce();

  // calls line control points back home
  if (applyHomeForce()) {
    // if all are close enough to home, pick a new color
    setRandomCircleColor();
  }

  gWorld.update();

  drawLines();
}

function mouseClicked() {
  if (isLooping()) {
    noLoop();
  } else {
    loop();
  }
}

function createParticle(posX, posY) {
  let p = new c2.Particle(posX, posY);
  p.radius = 10;
  p.mass = p.radius;
  gWorld.addParticle(p);

  return p;
}

function getPIndex(rowIndex, colIndex) {
  return rowIndex * gRowCount + colIndex;
}

function createWeb(parent, level) {
  color(0);
  gRowCount = floor(height / gRowPadding) + 1;

  let adjRowPad = floor(height / (gRowCount - 1));

  gColCount = floor(width / gColPadding) + 1;
  let adjColPad = floor(width / (gColCount - 1));

  let lastRow = gRowCount - 1;
  let lastCol = gColCount - 1;
  for (let i = 0; i < gColCount; i++) {
    for (let j = 0; j < gRowCount; j++) {
      let x = i * adjColPad;
      let y = j * adjRowPad;
      let p = createParticle(x, y);
      let static = j === 0 || j === lastRow ? true : false;
      let particleRef = { particle: p, isStatic: static, initX: x, initY: y };
      gParticles.push(particleRef);
    }
  }
}

function drawCircle() {
  fill(gCircleColor);
  noStroke();
  circle(width - mouseX, height - mouseY, gCircleDiameter);
}

function drawLines() {
  noFill();
  stroke(0);
  rect(0, 0, width, height);
  for (let i = 0; i < gColCount; i++) {
    beginShape();
    let firstParticle = gParticles[getPIndex(i, 0)];

    curveVertex(firstParticle.particle.position.x, -100);
    for (let j = 0; j < gRowCount; j++) {
      let p = gParticles[getPIndex(i, j)];
      curveVertex(p.particle.position.x, p.particle.position.y);
    }
    curveVertex(firstParticle.particle.position.x, height + 100);
    endShape();
  }
}

function applyMouseForce() {
  // apply mouse force only if mouse has moved
  let hasMoved = abs(movedX) > 1 && abs(movedY) > 1;

  if (hasMoved) {
    let mouseForce = new c2.PointField(new c2.Point(mouseX, mouseY), gMouseForce);

    gParticles.forEach((ref) => {
      if (!ref.isStatic) {
        mouseForce.apply(ref.particle);
      }
    });
  }
}

function applyHomeForce() {
  // apply home force to points
  // return true if all are close enough to home
  let isHome = true;
  gParticles.forEach((ref) => {
    let staticForce = new c2.PointField(new c2.Point(ref.initX, ref.initY), gHomeForce);
    staticForce.apply(ref.particle);

    let diff = abs(ref.particle.position.x - ref.initX);
    if (isHome && diff > 20) {
      isHome = false;
    }
  });
  return isHome;
}

function setRandomCircleColor() {
  gCircleColor = random(colorPalette);
}
