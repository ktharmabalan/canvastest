import { Point, ElementType, CanvasSquareElement, CanvasLineElement, CanvasCircleElement, CanvasScreen, ReticleElement } from './element/element';

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
const screen = new CanvasScreen(ElementType.Square, width, height, new Point(0, 0));
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
screen.addChild(reticle);
// line = new CanvasLineElement(ElementType.Line, new Point(centerX - length, centerY), new Point(centerX + length, centerY));
// screen.addChild(line);
// line = new CanvasLineElement(ElementType.Line, new Point(centerX, centerY - length), new Point(centerX, centerY + length));
// screen.addChild(line);

const circle = new CanvasCircleElement(ElementType.Circle, length * 5, new Point(centerX, centerY));
screen.addChild(circle);

let angle = 0;
const speed = .1;
const offset = .01;
let y = 0;
let x = 0;
const render = function() {
  x = Math.cos(angle) * offset * centerX;
  // y = Math.sin(angle) * offset * centerY;
  // console.log(angle);
  const point = new Point(x, y);
  reticle.updatePoint(point);
  // circle.updatePoint(point);
  screen.render(context);
  angle += speed;
  requestAnimationFrame(() => {
    render();
  });
  // if (angle >= 360) {
  //   angle = 0;
  // }
}

render();

// setTimeout(() => {
//   screen.removeChild(line);
//   screen.render(context);
// }, 1000);