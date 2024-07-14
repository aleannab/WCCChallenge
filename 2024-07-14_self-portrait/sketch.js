let gImageOG;
let gImageRef;
let gDotLayers = [];
let gDensityMin = 0.01;
let gDensityMax = 0.15;
let gPadding = 0.05;
let gBounds;
let gPositionOffset;

let gColorPalette = ['#d94e41', '#d9863d', '#f2b950', '#95bf93', '#46788c', '#556484'];

function preload() {
  gImageOG = loadImage('test.jpg');
  // gImageOG = loadImage('test02.png');
}

function setup() {
  let isPortrait = windowWidth < windowHeight;
  let w = isPortrait ? windowWidth : (3 * windowHeight) / 4;
  let h = isPortrait ? (4 * windowWidth) / 3 : windowHeight;
  createCanvas(0.95 * w, 0.95 * h);

  let length = isPortrait ? windowWidth : windowHeight;

  gDensityMax *= length;
  gDensityMin *= length;
  // console.log('max: ' + gDensityMax + ', min: ' + gDensityMin);
  gPadding *= length;

  setupDotLayers();
  noLoop();
}

function draw() {
  background(255);
  push();
  translate(gPositionOffset.x, gPositionOffset.y);

  noStroke();
  gDotLayers.forEach((layer) => {
    layer.draw();
  });
  pop();
}

function mouseClicked() {
  setupDotLayers();
}

function setupDotLayers() {
  gColorPalette = shuffle(gColorPalette);

  gDotLayers = [];
  gBounds = { xMin: 999, xMax: 0, yMin: 999, yMax: 0 }; // Reset gBounds
  let densities = [];
  let count = 5;
  for (let i = 0; i < count; i++) {
    densities.push(int(random(gDensityMin, gDensityMax)));
  }

  densities = sort(densities);
  for (let i = 0; i < densities.length; i++) {
    gDotLayers.push(new DotLayer(densities[i], gColorPalette[i % gColorPalette.length]));
  }
  // gDotLayers.push(new DotLayer(gDensityMax, gColorPalette[densities.length % gColorPalette.length]));

  let xp = (width - (gBounds.xMax - gBounds.xMin)) / 2 - gBounds.xMin;
  let yp = (height - (gBounds.yMax - gBounds.yMin)) / 2 - gBounds.yMin;
  gPositionOffset = createVector(xp, yp);

  redraw();
}

function checkBounds(xp, yp) {
  gBounds.xMin = min(gBounds.xMin, xp);
  gBounds.xMax = max(gBounds.xMax, xp);
  gBounds.yMin = min(gBounds.yMin, yp);
  gBounds.yMax = max(gBounds.yMax, yp);
}

function groupNeighbors(vertices, threshold) {
  let groups = [];

  // Create an array to keep track of visited vertices
  let visited = new Array(vertices.length).fill(false);

  for (let i = 0; i < vertices.length; i++) {
    if (!visited[i]) {
      // Start a new group
      let group = [];
      // Use a queue to perform a breadth-first search (BFS)
      let queue = [i];

      while (queue.length > 0) {
        let current = queue.shift();

        if (!visited[current]) {
          visited[current] = true;
          group.push(vertices[current]);

          // Check all other vertices to see if they are within the threshold distance
          for (let j = 0; j < vertices.length; j++) {
            if (!visited[j] && vertices[current].dist(vertices[j]) <= threshold) {
              queue.push(j);
            }
          }
        }
      }
      // Add the group to the list of groups
      groups.push(group);
    }
  }

  return groups;
}

class DotLayer {
  constructor(density, dotColor) {
    let edges = edgeDetect(gImageOG);
    let image = edges.get(0, 0, gImageOG.width, gImageOG.height);
    image.resize(0, density);
    image.filter(THRESHOLD, 0.3);

    let sectionWidth = (width - 2 * gPadding) / density;

    this.size = map(density, gDensityMax, gDensityMin, 0.6, 0.9) * sectionWidth;

    let yCount = floor((height - 2 * gPadding) / sectionWidth);
    let sectionHeight = (height - 2 * gPadding) / yCount;
    image.loadPixels();
    this.points = [];
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        let index = (x + y * image.width) * 4;
        if (image.pixels[index] === 0) {
          let xp = sectionWidth * x;
          let yp = sectionHeight * y;
          checkBounds(xp - this.size, yp - this.size);
          checkBounds(xp + this.size, yp + this.size);

          this.points.push(createVector(xp, yp));
        }
      }
    }
    this.groups = groupNeighbors(this.points, 1.5 * sectionWidth);

    this.color = dotColor;
    this.offset = createVector(random(-2, 2) * sectionWidth, random(-2, 2) * sectionWidth);
  }

  draw() {
    push();
    translate(this.offset.x, this.offset.y);
    fill(this.color);
    noStroke();
    stroke(this.color);
    strokeWeight(1);
    strokeCap(SQUARE);

    this.groups.forEach((group) => {
      if (group.length < 4) {
        strokeWeight(5);
        group.forEach((pt) => {
          // point(pt.x, pt.y);
        });
      } else {
        beginShape();
        curveVertex(group[0].x, group[0].y);

        strokeWeight(1);
        group.forEach((pt) => {
          if (random() < 0.5) curveVertex(pt.x, pt.y);
        });
        let lastIndex = group.length - 1;
        vertex(group[lastIndex].x, group[lastIndex].y);

        endShape();
      }
    });
    beginShape();
    this.points.forEach((pt) => {
      // ellipse(pt.x, pt.y, this.size * random(0.8, 1.2));
      // curveVertex(pt.x, pt.y);
      // line(pt.x, pt.y, pt.x + this.size * 2, pt.y);
    });
    endShape();
    pop();
  }
}

function edgeDetect() {
  // We are going to look at both image's pixels
  let destination = createImage(gImageOG.width, gImageOG.height);
  gImageOG.loadPixels();
  destination.loadPixels();

  // Since we are looking at left neighbors
  // We skip the first column
  for (var x = 1; x < gImageOG.width; x++) {
    for (var y = 0; y < gImageOG.height; y++) {
      var loc = (x + y * gImageOG.width) * 4;
      // The functions red(), green(), and blue() pull out the three color components from a pixel.
      var r = gImageOG.pixels[loc];
      var g = gImageOG.pixels[loc + 1];
      var b = gImageOG.pixels[loc + 2];

      // Pixel to the left location and color
      var leftLoc = (x - 1 + y * gImageOG.width) * 4;
      var rleft = gImageOG.pixels[leftLoc];
      var gleft = gImageOG.pixels[leftLoc + 1];
      var bleft = gImageOG.pixels[leftLoc + 2];
      // New color is difference between pixel and left neighbor
      var diff = 255 - abs((r + g + b) / 3 - (rleft + gleft + bleft) / 3);
      destination.pixels[loc] = diff;
      destination.pixels[loc + 1] = diff;
      destination.pixels[loc + 2] = diff;
      destination.pixels[loc + 3] = 255; // Always have to set alpha
    }
  }

  // We changed the pixels in destination
  destination.updatePixels();
  // Display the destination

  destination.resize(0, 500);
  destination.filter(THRESHOLD, 0.985);
  // destination.filter(ERODE);
  // destination.filter(THRESHOLD, 0.97);
  destination.resize(gImageOG.width, gImageOG.height);
  return destination;
}
