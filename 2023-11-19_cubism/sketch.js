// Created for the #WCCChallenge - Topic: Cubism
// Inspired by Marcel Duchamp's Nude Descending a Staircase, No. 2
//
// Abstract figures are created using bezier curves and quads.
// The sketchy outlines are drawn by randomly offsetting the control points of the shape
// Forward movement and rotation transformations for each body part give the illusion of walking
// Once figure is offscreen, they are moved back to the top of the "staircase"
//
// See other submissions here: https://openprocessing.org/curation/78544
// Join the Birb's Nest Discord community!  https://discord.gg/S8c7qcjw2b

// Color Palettes
let gColorPalette = [
  "#c1b48d",
  "#b5a97f",
  "#a2856a",
  "#706042",
  "#4c513d",
  "#706c4b",
];
let gHexAlpha = "C8";
let gBgPalette = ["#2f3127", "#3a3029", "#20201f"];

let gVelocityScalar = 0.03;
let gAngularVScalar = 0.005;

// Variables based on canvas size
let gUnitX;
let gUnitY;
let gInitPosX;
let gInitPosY;
let gIncX;
let gIncY;

// Max and min angles for body part rotation
let gOffsets = {
  upperBodyMin: 0,
  upperBodyMax: Math.PI / 10,
  headMin: Math.PI / 10 ,
  headMax: Math.PI / 4,
  hipMin: -Math.PI / 10,
  hipMax: Math.PI / 8,
  legMin: -Math.PI / 5,
  legMax: 0,
  ankleMin: 0,
  ankleMax: Math.PI / 4,
  figure: Math.PI / 8,
};

// Size scalars for body parts
let gPartSize = {
  head: {w: 1.3, h: 1.4},
  torso: {w: 1.5, h: 2},
  hips:  {w: 2, h: 1},
  thigh:  {w: 1, h: 1.75},
  ankle:  {w: 0.75, h: 1.8}
};

let gPeople = [];
let gPeopleCount = 8;

let gIsDebug = false;
let gRandSeed;

function setup() {
  let h = 0.95 * windowHeight;
  createCanvas(0.6 * h, h, WEBGL);
  gRandSeed = random(0, 999);
  
	// Initialize unit sizes based on canvas dimensions
  let countDivs = 5;
  gDivX = width / countDivs;
  gDivY = height / countDivs;
  
  let unitDivs = 10;
  gUnitX =  width / unitDivs;
  gUnitY = height / unitDivs;
  
  gInitPosX = - 7 * gUnitX;
  gInitPosY = - 2 * gUnitY;
  
	// Update body part sizes using unit scalars
  for (let part in gPartSize) {
		gPartSize[part].w *= gUnitX;
		gPartSize[part].h *= gUnitY;
	}

  // add alpha to colors;
  gColorPalette.forEach((_, index, palette) => {
    palette[index] = palette[index] + gHexAlpha;
  });
  
  
  // populate figures
  gIncX = (width + gUnitX * 2) / gPeopleCount;
  gIncY = 0.3 * (height + gUnitY * 2) / gPeopleCount;
  
  let randomVarX = 0.3 * gUnitX;
  let randomVarY = gUnitY;

  for (let i = 0; i < gPeopleCount; i++) {
    let pos = {
      x: i * gIncX + random(-randomVarX, randomVarX) + gInitPosX,
      y: i * gIncY + random(- randomVarY, randomVarY) + gInitPosY,
    };
    gPeople.push(new Person(pos));
  }  
}

function draw() {
	randomSeed(gRandSeed);
  background(random(gBgPalette));
	
	// Update time, this value will be used to calculate the rotation of the body parts
  time = millis() * gAngularVScalar;
  
	// If person is offscreen, they go to the end of the line
	// Shifting array is necessary to account for proper layer order
	// 
  let shouldShiftArray = false;
  gPeople.forEach((person) => {
    person.drawPerson(time);
    if (person.update()) {
      shouldShiftArray = true;
    }
  });

  if (shouldShiftArray) {
    if (gPeople.length > 0) {
      let lastItem = gPeople.pop(); // Remove the last element from the array
      gPeople.unshift(lastItem); // Add the last element to the front of the array
    }
  }

  if (gIsDebug && frameCount % 60 === 0) {
    console.log(frameRate());
  }
}

function getRandomValues(count, range) {
  let offsets = [];
  for (let i = 0; i < count; i++) {
    offsets.push(random(-range, range));
  }
  return offsets;
}
