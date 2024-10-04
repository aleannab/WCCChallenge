// Created for the #Genuary2024 - Day 18 - Bauhaus.
// https://genuary.art/prompts#jan18
//
// Inspired by Vasily Kandinsky's 𝘒𝘰𝘮𝘱𝘰𝘴𝘪𝘵𝘪𝘰𝘯 8, 1923

let gPalette = ['#F4D03F', '#C0392B', '#5DADE2', '#239B56', '#8E44AD', '#626567', '#E67E22'];

let gBgColor = '#626567';

let gUnit;

let gCards = [];
let gCardCount = 3;

function setup() {
  createCanvas(windowWidth, windowHeight);

  initCards();
  gUnit = 0.3 * height;
}

function draw() {
  background(0);
  for (let i = 0; i < gCards.length; i++) {
    image(gCards[i], 0, 0);
  }
}

function initCards() {
  gCards = [];
  for (let i = 0; i < gCardCount; i++) {
    let card = createGraphics(350, 525);
    card.rectMode(CENTER);
    card.background(0);
    drawACard(card);
    gCards.push(card);
  }
}

function drawACard(card) {
  card.background(gBgColor);
  placeObjectsRandomly(card, 0, int(random(1, 11)), 1); //swords
  // placeObjectsRadially(2, int(random(1, 11)), 1); //pentacles
  // placeObjectsRadially(1, int(random(1, 11)), 1); // wands
  // placeObjectsRadially(3, int(random(1, 11)), 1); //cups
}

function mouseClicked() {
  // drawAll();
}

function drawElement(card, pos, type, scale) {
  switch (type) {
    case 0:
      drawSword(card, pos, scale);
      break;
    case 1:
      drawWand(card, pos, scale);
      break;
    case 2:
      drawPentacles(card, pos, scale);
      break;
    case 3:
      drawCups(card, pos, scale);
      break;
  }
}

function placeObjectsRadially(card, type, num, scale) {
  let aInc = TWO_PI / num;
  for (let i = 0; i < num; i++) {
    let r = random(0.3, 0.4);
    if (i % 2 === 0) r *= random(0.3, 0.5);
    let x = cos(aInc * i + random()) * r * card.width + card.width / 2;
    let y = sin(aInc * i + random()) * r * card.height + card.height / 2;
    let pos = createVector(x, y);
    drawElement(card, pos, type, random(0.8, 1.5) * scale);
  }
}

function placeObjectsRandomly(card, type, num, scale) {
  for (let i = 0; i < num; i++) {
    let xp = random(0.2, 0.8) * card.width;
    let yp = random(0.2, 0.8) * card.height;
    let pos = createVector(xp, yp);
    drawElement(card, pos, type, random(0.8, 1.5) * scale);
  }
}

function drawWand(card, pos, scale) {
  // setRandStroke(5);
  card.stroke(random(gPalette));
  card.strokeWeight(10);
  card.push();
  card.translate(pos.x, pos.y);
  card.randRotate(true);
  card.noFill();
  let length = random(2, 3) * scale * gUnit;
  let xVar = 0.02 * scale * gUnit;
  let num = 10;
  let inc = length / num;
  let yp = -length / 2;
  card.beginShape();
  for (let i = 0; i < num; i++) {
    card.curveVertex(random(-xVar, xVar), yp + inc * i);
  }

  card.endShape();

  card.pop();
}

function drawSword(card, pos, scale) {
  // getRandBool() ? fill(0) : setRandFill();
  card.fill(random(gPalette));
  card.push();
  card.translate(pos.x, pos.y);
  randRotate(false);
  noStroke();
  let length = scale * gUnit;
  let w = random(0.03, 0.05) * gUnit;
  circle(0, -length / 2, 2 * w);
  rect(0, 0, w, length);
  rect(0, -0.375 * length, 0.158 * length, w);
  triangle(0.5 * w, 0.5 * length, -0.5 * w, 0.5 * length, 0, 0.6 * length);
  pop();
}

function drawPentacles(pos, scale) {
  // noFill();
  push();
  translate(pos.x, pos.y);
  let d = random(0.3, 0.5) * gUnit * scale;
  strokeWeight(3);

  stroke(gBgColor);
  // if (getRandBool(0.5)) {
  //   let c = random(gPalette);
  //   // setRandStroke();
  //   fill(random(gPalette));
  //   circle(0, 0, random(1.3, 1.5) * d);
  // }
  // setRandStroke(2);

  fill(random(gPalette));

  circle(0, 0, d);

  let radius = random(0.3, 0.4) * d;
  noFill();

  let angle = TWO_PI / 5; // 72 degrees per point
  let points = [];

  // Calculate the points on the circumference
  for (let a = -PI / 2; a < TWO_PI - PI / 2; a += angle) {
    let x = cos(a) * radius;
    let y = sin(a) * radius;
    points.push({ x: x, y: y });
  }

  push();
  rotate(random(360));
  // Draw the star by connecting every second point
  beginShape();
  for (let i = 0; i < points.length; i++) {
    let nextIndex = (i + 3) % points.length; // Skip one point ahead to create the star
    vertex(points[i].x, points[i].y);
    vertex(points[nextIndex].x, points[nextIndex].y);
  }
  endShape(CLOSE);
  pop();
  pop();
}

function drawCups(pos, scale) {
  push();
  translate(pos.x, pos.y);
  randRotate(true);
  setRandStroke();
  getRandBool() ? fill(1) : noFill();

  let d = random(0.2, 0.5) * scale * gUnit;

  setRandFill();
  let offset = 2 * d;
  arc(0, 0, d, d, PI - 0.2, TWO_PI + 0.2, CHORD);
  line(0, -0.5 * d, 0, -1.2 * d);
  line(0.1 * d, -1.2 * d, -0.1 * d, -1.2 * d);

  pop();
}

function randTransform(isRight = false) {
  randTranslate();
  randRotate(isRight);
}

function randTranslate() {
  let xp = random(0.2, 0.8) * width;
  let yp = random(0.2, 0.8) * height;
  translate(xp, yp);
}

function randRotate(isRight = true, max = TWO_PI) {
  let angle = isRight ? floor(random(0, 4)) * HALF_PI : floor(random(0, 4)) * QUARTER_PI;
  rotate(angle);
}

function setRandFill() {
  fill(random(gPalette));
}

function setRandStroke(max = 2) {
  stroke(0);
  strokeWeight(random(1, max));
}

function getRandBool(odds = 0.5) {
  return random() < odds;
}

class Card {
  constructor(canvas, number) {
    this.canvas = canvas;
    this.number = number;
  }

  draw() {}
}

class SwordCard extends Card {
  constructor(canvas, number) {
    super(canvas, number);
  }
}
