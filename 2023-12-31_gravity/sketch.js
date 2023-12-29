//Created by Ren Yuan

let world;

let rectangle;

let gUpdateGravityTime = 0;

let gGravity;

function setup() {
  createCanvas(960, 540);
  colorMode(HSL, 360, 100, 100);
  ellipseMode(RADIUS);

  world = new c2.World(new c2.Rect(0, 0, width, height));

  gGravity = new c2.ConstForce(new c2.Vector(0, 1));
  world.addForce(gGravity);

  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    let p = new c2.Particle(x, y);
    p.radius = random(5, 10);
    p.color = color(random(0, 30), random(30, 60), random(20, 100));

    world.addParticle(p);
    gGravity.apply(p);
  }

  let collision = new c2.Collision();
  world.addInteractionForce(collision);

  let leftTop = new c2.Point(width / 4, (height / 8) * 3);
  let rightBottom = new c2.Point((width / 4) * 3, (height / 8) * 5);
  rectangle = new c2.Rect(leftTop, rightBottom);
  let rectConstraint = new c2.PolygonConstraint(rectangle);
  world.addConstraint(rectConstraint);
  noStroke();
}

function draw() {
  //background('#cccccc')

  drawingContext.setLineDash([5, 5]);
  noFill();
  rect(rectangle.p.x, rectangle.p.y, rectangle.w, rectangle.h);

  world.update();

  for (let i = 0; i < world.particles.length; i++) {
    let p = world.particles[i];
    // stroke('#333333');
    // strokeWeight(1);
    drawingContext.setLineDash([]);
    fill(p.color);
    circle(p.position.x, p.position.y, p.radius);
    strokeWeight(2);
    point(p.position.x, p.position.y);
  }

  let curTime = millis();
  if (curTime > gUpdateGravityTime) {
    gGravity.force = new c2.Vector(random(-1, 1), random(-1, 1));
    gUpdateGravityTime = curTime + 1000;
  }
}
