let gWorld;

let colorPalette = ['#4466ff', '#aa33ff', '#ee0000', '#008800', '#dd1188'];

let gRowPadding = 50;
let gColPadding = 10;
let gRowCount;
let gColCount;
let gParticles = [];
let gCircleColor;

function setup() {
  createCanvas(0.9 * windowWidth, 1.0 * windowHeight);
  colorMode(HSL, 360, 100, 100);
  ellipseMode(RADIUS);

  gWorld = new c2.World(new c2.Rect(0, 0, width, height));
  createWeb();

  stroke(0);
  strokeWeight(20);

  gCircleColor = random(colorPalette);
}

function draw() {
  background('#FFFFFF');
  fill(gCircleColor);
  noStroke();
  circle(width - mouseX, height - mouseY, 200);

  let hasMoved = abs(movedX) > 1 && abs(movedY) > 1;

  if (hasMoved) {
    let mouseForce = new c2.PointField(new c2.Point(mouseX, mouseY), -30);

    gParticles.forEach((ref) => {
      let staticStrength = 5;
      if (ref.isStatic) {
        staticStrength = 20;
      } else {
        mouseForce.apply(ref.particle);
      }
    });
  }

  let isHome = true;
  gParticles.forEach((ref) => {
    let staticStrength = 5;
    if (ref.isStatic) {
      staticStrength = 20;
    }
    let staticForce = new c2.PointField(new c2.Point(ref.initX, ref.initY), staticStrength);
    staticForce.apply(ref.particle);

    let diff = abs(ref.particle.position.x - ref.initX);

    if (isHome && diff > 20) {
      isHome = false;
    }
  });

  if (isHome) {
    gCircleColor = random(colorPalette);
  }

  gWorld.update();

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
      //circle(p.particle.position.x, p.particle.position.y, 10);
    }
    curveVertex(firstParticle.particle.position.x, height + 100);
    endShape();
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
