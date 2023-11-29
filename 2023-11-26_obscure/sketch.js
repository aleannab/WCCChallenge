let world;
let gRowCount = 10;
let gColCount = 10;

function createParticle(posX, posY) {
  let p = new c2.Particle(posX, posY);
  p.radius = 10;
  p.mass = p.radius;
  world.addParticle(p);

  return p;
}

function getPIndex(rowIndex, colIndex) {
  return rowIndex * gRowCount + colIndex;
}

function createWeb(parent, level) {
  color(0);
  let rowPad = floor(width / (gRowCount - 1));
  let columnPad = floor(height / (gColCount - 1));
  for (let i = 0; i < gColCount; i++) {
    for (let j = 0; j < gRowCount; j++) {
      let p = createParticle(i * columnPad, j * rowPad);
    }
  }

  for (let i = 0; i < gRowCount; i++) {
    for (let j = 0; j < gColCount; j++) {
      let currentP = world.particles[i * gRowCount + j];
      let neighbors = getNeighbors(i, j);

      neighbors.forEach((neighbor) => {
        let s = new c2.Spring(currentP, neighbor);
        s.length = dist(
          currentP.position.x,
          currentP.position.y,
          neighbor.position.x,
          neighbor.position.y
        );
        world.addSpring(s);
      });
    }
  }
}

function setup() {
  createCanvas(500, 500); //0.8 * windowWidth, 0.8 * windowHeight);
  colorMode(HSL, 360, 100, 100);
  ellipseMode(RADIUS);

  world = new c2.World(new c2.Rect(0, 0, width, height));
  background("#cccccc");
  createWeb();

  quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height));
  let collision = new c2.Collision(quadTree);
  world.addInteractionForce(collision);

  let constForce = new c2.ConstForce(0, 1);
  world.addForce(constForce);
  
  stroke(0);
  fill(0);
}

function draw() {
  background("#FFFFFF");

  //world.update();

  for (let i = 0; i < world.springs.length; i++) {
    let s = world.springs[i];
    
    line(s.p1.position.x, s.p1.position.y, s.p2.position.x, s.p2.position.y);
  }

  for (let i = 0; i < world.particles.length; i++) {
    let p = world.particles[i];
    circle(p.position.x, p.position.y, p.radius);
  }
}

function getNeighbors(i, j) {
  let aboveInBound = i > 0;
  let belowInBound = i < gRowCount - 1;
  let leftInBound = j > 0;
  let rightInBound = j < gColCount - 1;
  let neighbors = [];
  // above
  if (aboveInBound) {
    neighbors.push(world.particles[getPIndex(i - 1, j)]);
  }
  // below
  if (belowInBound) {
    neighbors.push(world.particles[getPIndex(i + 1, j)]);
  }
  // left
  if (leftInBound) {
    neighbors.push(world.particles[getPIndex(i, j - 1)]);
  }
  // right
  if (rightInBound) {
    neighbors.push(world.particles[getPIndex(i, j + 1)]);
  }
  return neighbors;
}
