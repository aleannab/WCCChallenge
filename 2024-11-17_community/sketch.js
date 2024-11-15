//  by Antoinette Bumatay-Chan
// Created for the #WCCChallenge - Topic: Community
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

//Created by Ren Yuan

let world;

let gCumulative = [];

// palette and percentages were made with the help of ChatGPT and random hair color dye swatches I found on google
const gPaletteWithPercentages = [
  { color: '#e4e1ce', percentage: 2 }, // platinum blonde (very light blonde, often bleached)
  { color: '#998880', percentage: 5 }, // light brown (a common natural color)
  { color: '#d3bc9a', percentage: 3 }, // light blonde (a natural blonde hair color)
  { color: '#d5a577', percentage: 10 }, // dirty blonde (a darker blonde shade, often with brownish tones)
  { color: '#e3b883', percentage: 1 }, // light peach (often a light, warm, dyed shade)
  { color: '#dfa345', percentage: 1 }, // caramel (a warm, brownish-orange color, typically dyed)

  { color: '#53381a', percentage: 11 }, // medium brown (a common natural brown shade)
  { color: '#6e3e18', percentage: 14 }, // dark brown (a common natural dark brown shade)
  { color: '#9e6731', percentage: 10 }, // light brown (a lighter, warm brown color)
  { color: '#f2b062', percentage: 2 }, // light blonde (dyed, often achieved through bleaching)
  { color: '#cd832c', percentage: 2 }, // reddish brown (a rich brown with red undertones, often dyed)
  { color: '#ac422a', percentage: 2 }, // auburn (a reddish-brown, either natural or dyed)

  { color: '#864438', percentage: 7 }, // auburn (a deep reddish-brown, commonly seen in natural hair)
  { color: '#772e1f', percentage: 7 }, // deep brown (a very dark brown shade)
  { color: '#8b181d', percentage: 6 }, // deep red-brown (often seen in dark auburn or red-brown hair)
  { color: '#620a16', percentage: 5 }, // deep red (a rich, dark red, often dyed)
  { color: '#270e11', percentage: 4 }, // black (a natural jet black shade)
  { color: '#171111', percentage: 4 }, // black (a very dark black, natural to many populations)

  { color: '#744b72', percentage: 0.5 }, // purple
  { color: '#466e38', percentage: 0.5 }, // green
  { color: '#8798ab', percentage: 0.5 }, // cool blue
  { color: '#8798ab', percentage: 0.5 }, // pink
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  ellipseMode(RADIUS);
  setupColorProbabilities();

  world = new c2.World(new c2.Rect(0, 0, width, height));

  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    let p = new c2.Particle(x, y);
    p.radius = random(0.015, 0.03) * height;
    p.color = getRandomColor();
    p.mass = random(2, 5);

    world.addParticle(p);
  }

  let collision = new c2.Collision();
  world.addInteractionForce(collision);

  let pointField = new c2.PointField(new c2.Point(width / 2, height / 2), 1);
  world.addForce(pointField);
}

function draw() {
  background(255);

  world.update();

  noStroke();
  for (let i = 0; i < world.particles.length; i++) {
    let p = world.particles[i];
    // stroke('#333333');
    // strokeWeight(1);
    fill(p.color);
    circle(p.position.x, p.position.y, 0.8 * p.radius);
    // strokeWeight(2);
    // point(p.position.x, p.position.y);
  }
}

function setupColorProbabilities() {
  let sum = 0;
  for (let i = 0; i < gPaletteWithPercentages.length; i++) {
    sum += gPaletteWithPercentages[i].percentage;
    gCumulative.push(sum);
  }
}

function getRandomColor() {
  let rand = random(100);

  for (let i = 0; i < gCumulative.length; i++) {
    if (rand < gCumulative[i]) {
      return gPaletteWithPercentages[i].color;
    }
  }
  return random(gPaletteWithPercentages).color;
}
