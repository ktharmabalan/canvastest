import { Point, ElementType, CanvasSquareElement, CanvasLineElement, CanvasCircleElement, CanvasScreen, ReticleElement } from './element/element';
import { clamp, pointDistance, circleCollision, circlePointCollision, } from './utils/utils';

const app = <HTMLDivElement>document.getElementById('app');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');

let width: number = app.clientWidth;
let height: number = app.clientHeight;
canvas.width = width;
canvas.height = height;

const screenWidth = width * 2;
const screenHeight = height * 2;

const context = <CanvasRenderingContext2D>canvas.getContext('2d');
// move to middle of screen
// context.translate(-centerX / 2, -centerY / 2);
// context.scale(1, -1); // reverse y-axis

// height = -height
const ratio = width >= height ? (width / height) : (height / width);
const screen = new CanvasScreen(ElementType.Square, width - 150 * ratio, height - 150, new Point(50 * ratio, 50));
// const screen = new CanvasScreen(ElementType.Square, screenWidth, screenHeight);
let line = new CanvasLineElement(ElementType.Line, new Point(0, 0), new Point(width, height));
screen.addChild(line);

// // Create Reticle
const centerX = width/2;
const centerY = height/2;
const length = 50;
const reticle = new ReticleElement(ElementType.Reticle);
reticle.addChild(new CanvasLineElement(ElementType.Line, new Point(centerX - length, centerY), new Point(centerX + length, centerY)));
reticle.addChild(new CanvasLineElement(ElementType.Line, new Point(centerX, centerY - length), new Point(centerX, centerY + length)));
// screen.addChild(reticle);
// line = new CanvasLineElement(ElementType.Line, new Point(centerX - length, centerY), new Point(centerX + length, centerY));
// screen.addChild(line);
// line = new CanvasLineElement(ElementType.Line, new Point(centerX, centerY - length), new Point(centerX, centerY + length));
// screen.addChild(line);
const baseRadius = length * 2;
const circle = new CanvasCircleElement(ElementType.Circle, baseRadius, new Point(centerX, centerY));
circle.addChild(reticle);
screen.addChild(circle);

const mouseCircle = new CanvasCircleElement(ElementType.Circle, 20, new Point(centerX, centerY));
screen.addChild(mouseCircle);
 
let mouseDown = false;
canvas.addEventListener('mousedown', () => {
  // console.log('mousedown');
  mouseDown = true;
});

canvas.addEventListener('mouseup', (event) => {
  event.stopPropagation();
  // console.log('mouseup');
  mouseDown = false;
});

document.addEventListener('mouseup', () => {
  // console.log('document mouseup');
  mouseDown = false;
});

let mouseX = centerX;
let mouseY = centerY;

document.body.addEventListener('mousemove', (event) => {
  // console.log('move');
  mouseX = clamp(event.clientX, screen.point1.x.valueOf() + 20, screen.point2.x.valueOf() - 20 + 50 * ratio);
  mouseY = clamp(event.clientY, screen.point1.y.valueOf() + 20, screen.point2.y.valueOf() - 20 + 50);
});

// canvas.addEventListener('mousemove', (event) => {
//   if (!mouseDown) return;
//   console.log('dragging');
// });

const speed = .1;
const offset = .5;
const baseAlpha = 0.5;

let angle = 0;
let y = 0;
let x = 0;
let radius = baseRadius;

const render = function() {

  // rotate in circle
  // x = Math.cos(angle) * baseRadius;
  // y = Math.sin(angle) * baseRadius;
  // circle.updatePoint(new Point(x + centerX, y + centerY));

  // Update point
  // x = Math.cos(angle) * offset;
  // y = Math.sin(angle) * offset;
  
  // const point = new Point(x, y);
  // reticle.updatePoint(point);

  // Scale
  // radius = Math.sin(angle) * offset * 30 + baseRadius;
  // circle.updateRadius(radius);

  // Mouse move circle
  mouseCircle.updatePoint(new Point(mouseX, mouseY));

  // Test collision
  // if (circleCollision(circle, mouseCircle)) {
  if (circlePointCollision(circle.point1, mouseCircle)) {
    mouseCircle.updateAlpha(1);
  } else {
    mouseCircle.updateAlpha(0);
  }
  // circle.updateAlpha(baseAlpha + Math.sin(angle) * offset);

  screen.render(context);
  // angle += speed;
  requestAnimationFrame(() => {
    render();
  });
}

render();

// setTimeout(() => {
//   screen.removeChild(line);
//   screen.render(context);
// }, 1000);