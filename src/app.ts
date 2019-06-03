import { Point, ElementType, CanvasSquareElement, CanvasLineElement, CanvasCircleElement, CanvasScreen, ReticleElement, CanvasElement } from './element/element';
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
 
let nested = true;
const rectWidth = 150;
let rects: CanvasSquareElement[] = [] ;
for (let index = 0; index < 5; index++) {
  if (nested) {
    rects.push(new CanvasSquareElement(ElementType.Square, rectWidth, rectWidth, new Point(screen.point1.x.valueOf() + 50 * index, screen.point1.y.valueOf() + 50 * index)));
  } else {
    screen.addChild(new CanvasSquareElement(ElementType.Square, rectWidth, rectWidth, new Point(screen.point1.x.valueOf() + 50 * index, screen.point1.y.valueOf() + 50 * index)));
    // rect = new CanvasSquareElement(ElementType.Square, rectWidth, rectWidth, new Point(screen.point1.x.valueOf() + 50 + (rectWidth + 20) * index, screen.point1.y.valueOf() + 50 + (rectWidth + 20) * index));
  }
}

if (nested) {
  let rect: CanvasSquareElement | null = null;
  rects.reverse().forEach((r, i) => {
    // console.log(i);
    if (i !== 0 && rect !== null) {
      r.addChild(rect);
    }
    rect = r;
  });
  
  if (rect !== null) {
    screen.addChild(rect);
  }
}

let mouseX = width * 10;
let mouseY = height * 10;

let mouseDown = false;
let mouseDownPoint: Point | null = null;
let temp: Point | null = null;
canvas.addEventListener('mousedown', (event) => {
  // console.log('mousedown');
  temp = new Point(event.clientX, event.clientY);
  mouseDown = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
});

canvas.addEventListener('mouseup', (event) => {
  event.stopPropagation();
  // console.log('mouseup');
  mouseDown = false;
  mouseDownPoint = null;
  if (temp !== null) {
    mouseDownPoint = temp;
    temp = null;
  }
  mouseX = width * 10;
  mouseY = height * 10;
});

document.addEventListener('mouseup', () => {
  // console.log('document mouseup');
  mouseDown = false;
  mouseDownPoint = null;
  if (temp !== null) {
    mouseDownPoint = temp;
    temp = null;
  }
  mouseX = width * 10;
  mouseY = height * 10;
});

// document.body.addEventListener('mousemove', (event) => {
window.addEventListener('mousemove', (event) => {
  // console.log('move');
  mouseX = event.clientX;
  mouseY = event.clientY;
  // mouseX = clamp(event.clientX, screen.point1.x.valueOf() + 20, screen.point2.x.valueOf() - 20 + 50 * ratio);
  // mouseY = clamp(event.clientY, screen.point1.y.valueOf() + 20, screen.point2.y.valueOf() - 20 + 50);
});

window.addEventListener('mouseleave', (event) => {
  mouseX = width * 10;
  mouseY = height * 10;
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

const collisionCheck = (element: CanvasElement, movePoint: Point, nested: Boolean, selectTop: Boolean = false, top: CanvasElement | null, clickPoint: Point | null) : CanvasElement[] => {
  const children = element.children;
  const childrenCount = children.length;
  
  let colliding: CanvasElement[] = [];
  if (selectTop) {
    if (nested) {
      // for (let index = childrenCount - 1; index > 0; index--) {
      if (childrenCount !== 0) {
        for (let index = 0; index < childrenCount; index++) {
          const child = children[index];
          colliding = colliding.concat(collisionCheck(child, movePoint, nested, selectTop, top, clickPoint));
  
          // if (top !== null && top !== element) {
          //   element.select(false);
          // }
          if (!mouseDown && clickPoint !== null && child.checkCollision(clickPoint)) {
            child.select(!child.isSelected);
            // element.select(true);
            // return colliding;
            // console.log(index, element, child);
            // break;
            // if (top === null) {
            //   top = element;
            // } else {
            //   // child.select(false);
            //   child.select(!child.isSelected);
            // }
          }
          // colliding = colliding.concat(collisionCheck(child, movePoint, nested, selectTop, top, clickPoint));
  
          // // collisionCheck(child, movePoint, nested, selectTop, clickPoint);
          if (child.checkCollision(movePoint) && !colliding.length && !colliding.includes(child)) {
            colliding.push(child);
          }
        }
      } else {
        if (!mouseDown && clickPoint !== null && element.checkCollision(clickPoint)) {
          element.select(!element.isSelected);
        }
      }
    } else {
      for (let index = childrenCount - 1; index > 0; index--) {
        const child = children[index];

        if (child.checkCollision(movePoint) && !colliding.length && !colliding.includes(child)) {
          colliding.push(child);
        }
            
        if (!mouseDown && clickPoint !== null && child.checkCollision(clickPoint)) {
          child.select(!child.isSelected);
          break;
        }
      }
    }
  } else {
    for (let index = 0; index < childrenCount; index++) {
      const child = children[index];
      colliding = colliding.concat(collisionCheck(child, movePoint, nested, selectTop, top, clickPoint));

      if (child.checkCollision(movePoint) && !colliding.includes(child)) {
        colliding.push(child);
      }
          
      if (!mouseDown && clickPoint !== null && child.checkCollision(clickPoint)) {
        child.select(!child.isSelected);
      }
    }
  }

  return colliding;
}

let selectTop = true;
// selectTop
//    nested: select the last descendent of a element 
//    else: select all decendents of an element
// else
//   nested

const render = () => {
  const point = new Point(mouseX, mouseY);
  // if (mouseDownPoint !== null) {
  //   point = mouseDownPoint;
  // }

  // screen.checkCollision(point);

  // Check point collision with children of screen
  const colliding = collisionCheck(screen, point, nested, selectTop, null, mouseDownPoint);
  mouseDownPoint = null;

  // if (maxDepth !== 0) {
  //   console.log(maxDepth, point);
  // }
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
  // mouseCircle.updatePoint(point);

  // Test collision
  // if (circlePointCollision(circle.point1, mouseCircle)) {
  //   mouseCircle.updateAlpha(1);
  // } else {
  //   mouseCircle.updateAlpha(0);
  // }
  // circle.updateAlpha(baseAlpha + Math.sin(angle) * offset);

  screen.render(context, colliding);
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