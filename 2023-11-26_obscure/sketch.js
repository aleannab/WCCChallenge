let gWorld;
let gRowCount = 30;
let gColCount = 30;
let gParticles = [];


function setup() {
  createCanvas(0.9 * windowWidth, 1.0 * windowHeight);
  colorMode(HSL, 360, 100, 100);
  ellipseMode(RADIUS);

  gWorld = new c2.World(new c2.Rect(0, 0, width, height));
  createWeb();
  
  stroke(0);
  strokeWeight(25);
  fill(0);

}

function draw() {
  background("#FFFFFF");

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
 gParticles.forEach((ref) => {
    let staticStrength = 5;
    if (ref.isStatic) {
      staticStrength = 20;
    }
let staticForce = new c2.PointField(new c2.Point(ref.initX, ref.initY), staticStrength);
  staticForce.apply(ref.particle);
  });

  


  gWorld.update();

  for (let i = 0; i < gColCount; i++) {
    noFill();
    beginShape();
    for (let j = 0; j < gRowCount; j++) {
      let p = gParticles[getPIndex(i, j)];
      curveVertex(p.particle.position.x, p.particle.position.y);
    }
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
  let buffer = 100;
  let rowPad = floor((width + 2* buffer) / (gRowCount - 1));
  let columnPad = floor((height + 2* buffer) / (gColCount - 1));
  let lastRow = gRowCount - 1;
  let lastCol = gColCount - 1;
  for (let i = 0; i < gColCount; i++) {
    for (let j = 0; j < gRowCount; j++) {
      let x = i * rowPad - buffer;
      let y = j * columnPad - buffer;
      let p = createParticle(i * rowPad - buffer, j * columnPad - buffer);
      let static = i === 0 || i === lastCol || j === 0 || j === lastRow ? true : false;
      let particleRef = { particle: p, isStatic: static, initX: x, initY: y};
      gParticles.push(particleRef);
    }
  }
}