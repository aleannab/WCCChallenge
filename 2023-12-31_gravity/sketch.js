// Created for the #WCCChallenge

let gLastTime = 0;

let system;
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  system = new ParticleSystem(createVector(0, 0, 0));
  system.addParticle();
}

function mouseClicked() {}

function draw() {
  orbitControl();
  background(51);
  const curTime = millis();
  let dt = curTime - gLastTime;
  gLastTime = curTime;
  dt *= 0.1;

  system.addParticle();
  system.run(dt);
}

class Particle {
  constructor(position) {
    this.velocity = createVector(random(-1, 1), 0, random(-1, 1));

    this.position = position.copy();
    this.lifespan = 255;
    this.mass = 30;
  }

  run(dt) {
    this.update(dt);
    this.draw();
  }

  update(dt) {
    let netForce = createVector(0, 1, 0).div(this.mass);
    let acceleration = p5.Vector.mult(netForce, dt);
    this.velocity.add(acceleration);
    let dPos = p5.Vector.mult(this.velocity, dt).add(p5.Vector.mult(acceleration, 0.5 * dt * dt));
    this.position.add(dPos);
    this.lifespan -= 2;
  }

  draw() {
    stroke(200, this.lifespan);
    strokeWeight(2);
    fill(127, this.lifespan);
    push();
    translate(this.position.x, this.position.y, this.position.z);
    sphere(5);
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}

class ParticleSystem {
  constructor(position) {
    this.origin = position.copy();
    this.particles = [];
  }

  addParticle() {
    this.particles.push(new Particle(this.origin));
  }

  run(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.run(dt);
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}
