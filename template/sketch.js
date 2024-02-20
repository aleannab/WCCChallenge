// Created for the #WCCChallenge
let isDebug = false;
let gOGSettings;

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (isDebug) {
    initPanel();
    gOGSettings = settings.map((obj) => deepCopy(obj));
  }

  createNewArt();
}

function draw() {
  background(255);
}

function createNewArt() {}

function mouseClicked() {
  createNewArt();
}
