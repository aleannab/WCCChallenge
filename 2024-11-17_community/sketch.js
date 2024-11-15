//  by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Community
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

//Created by Ren Yuan

let world;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 100);
  ellipseMode(RADIUS);

  world = new c2.World(new c2.Rect(0, 0, width, height));

  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    let p = new c2.Particle(x, y);
    p.radius = random(0.01, 0.02) * height;
    p.color = color(random(0, 8), random(30, 60), random(20, 100));
    p.mass = random(0.5, 1);

    world.addParticle(p);
  }

  let collision = new c2.Collision();
  world.addInteractionForce(collision);

  let pointField = new c2.PointField(new c2.Point(width / 2, height / 2), 0.1);
  world.addForce(pointField);
}

function draw() {
  background('#cccccc');

  world.update();

  for (let i = 0; i < world.particles.length; i++) {
    let p = world.particles[i];
    stroke('#333333');
    strokeWeight(1);
    fill(p.color);
    circle(p.position.x, p.position.y, p.radius);
    strokeWeight(2);
    point(p.position.x, p.position.y);
  }
}
