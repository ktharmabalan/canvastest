import { Point, ElementType, CanvasSquareElement, CanvasLineElement, CanvasCircleElement, CanvasScreen, ReticleElement, CanvasElement, CanvasSelectSquareElement } from './element/element';
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
// const screen = new CanvasScreen(ElementType.Square, width - 150 * ratio, height - 150, new Point(50 * ratio, 50));
const screen = new CanvasScreen(ElementType.Square, screenWidth, screenHeight);
let line = new CanvasLineElement(ElementType.Line, new Point(0, 0), new Point(width, height));
screen.addChild(line);

// // Create Reticle
const centerX = width/2;
const centerY = height/2;
const length = 50;
const reticle = new ReticleElement(ElementType.Reticle);
reticle.addChild(new CanvasLineElement(ElementType.Line, new Point(centerX - length, centerY), new Point(centerX + length, centerY)));
reticle.addChild(new CanvasLineElement(ElementType.Line, new Point(centerX, centerY - length), new Point(centerX, centerY + length)));

const baseRadius = length * 2;
const circle = new CanvasCircleElement(ElementType.Circle, baseRadius, new Point(centerX, centerY));
circle.addChild(reticle);
screen.addChild(circle);

const mouseCircle = new CanvasCircleElement(ElementType.Circle, 20, new Point(centerX, centerY));
screen.addChild(mouseCircle);
 
let nested = false;
const rectWidth = 150;
let rects: CanvasSquareElement[] = [] ;
for (let index = 0; index < 5; index++) {
  if (nested) {
    rects.push(new CanvasSquareElement(ElementType.Square, rectWidth, rectWidth, new Point(screen.point1.x.valueOf() + 50 * index, screen.point1.y.valueOf() + 50 * index)));
  } else {
    screen.addChild(new CanvasSquareElement(ElementType.Square, rectWidth, rectWidth, new Point(screen.point1.x.valueOf() + rectWidth * index, screen.point1.y.valueOf() + 50 * index)));
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

let selecting: CanvasElement[] = [];

const keyPressed: number[] = [];
const keyToListen: number[] = [16];
const keyMap = {
  shift: 16,
};

let mouseX = width * 10;
let mouseY = height * 10;

let mouseDown = false;
let mouseDownPoint: Point | null = null;
let temp: Point | null = null;

let drawPoint: Point | null = null;
let selectRect: CanvasSelectSquareElement | null = null;
let dragging = false;

canvas.addEventListener('mousedown', (event) => {
  // console.log('mousedown');
  temp = new Point(event.clientX, event.clientY);
  mouseDown = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
  
  selectRect = null;

  if (!keyPressed.includes(keyMap.shift)) {
    selecting = [];
  } else {
    drawPoint = new Point(mouseX, mouseY);
  }
});

const mouseUp = (event: MouseEvent | null = null) => {
  mouseDown = false;
  mouseDownPoint = null;
  if (temp !== null) {
    mouseDownPoint = temp;
    temp = null;
  }
  mouseX = width * 10;
  mouseY = height * 10;
  
  // if (drawPoint !== null && event !== null) {
  //   // selectRect = new CanvasSelectSquareElement(ElementType.Square, 0, 0, drawPoint, new Point(event.clientX, event.clientY));
  //   // console.log(selectRect);
  // }
  
  selectRect = null;
  drawPoint = null;
  dragging = false;
};

canvas.addEventListener('mouseup', (event) => {
  event.stopPropagation();
  mouseUp(event);
});

document.addEventListener('mouseup', () => {
  mouseUp()
});

// document.body.addEventListener('mousemove', (event) => {
window.addEventListener('mousemove', (event) => {
  dragging = true;
  // console.log('move');
  mouseX = event.clientX;
  mouseY = event.clientY;
  // mouseX = clamp(event.clientX, screen.point1.x.valueOf() + 20, screen.point2.x.valueOf() - 20 + 50 * ratio);
  // mouseY = clamp(event.clientY, screen.point1.y.valueOf() + 20, screen.point2.y.valueOf() - 20 + 50);
  
  if (drawPoint !== null && event !== null) {
    selectRect = new CanvasSelectSquareElement(ElementType.Square, 0, 0, drawPoint, new Point(event.clientX, event.clientY));
    // console.log(selectRect);
  }
});

window.addEventListener('mouseleave', (event) => {
  mouseX = width * 10;
  mouseY = height * 10;
});

document.addEventListener('keydown', (event) => {
  // console.log(event.keyCode);
  if (keyToListen.includes(event.keyCode) && !keyPressed.includes(event.keyCode)) {
    keyPressed.push(event.keyCode);
  }
});

document.addEventListener('keyup', (event) => {
  // console.log(event.keyCode);
  const idx = keyPressed.indexOf(event.keyCode);
  if (keyToListen.includes(event.keyCode) && idx !== -1) {
    keyPressed.splice(idx, 1);
  }
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

const collisionCheck = (element: CanvasElement, movePoint: Point, nested: Boolean, selectTop: Boolean = false, top: CanvasElement | null, clickPoint: Point | null) : [CanvasElement[], CanvasElement[]] => {
  const children = element.children;
  const childrenCount = children.length;
  
  let colliding: CanvasElement[] = [];

  if (selectTop) {
    if (nested) {
      // DOES NOT WORK
      // for (let index = childrenCount - 1; index > 0; index--) {
      if (childrenCount !== 0) {
        for (let index = 0; index < childrenCount; index++) {
          const child = children[index];

          // ({ colliding, selecting }) = colliding.concat(collisionCheck(child, movePoint, nested, selectTop, top, clickPoint));
          const [colliding1, selecting1] = collisionCheck(child, movePoint, nested, selectTop, top, clickPoint);
          colliding = colliding.concat(colliding1);
          selecting = selecting.concat(selecting1);
  
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
      // if (keyPressed.includes(keyMap.shift))

      for (let index = childrenCount - 1; index > 0; index--) {
        const child = children[index];

        if (child.checkCollision(movePoint) && !colliding.length && !colliding.includes(child)) {
          colliding.push(child);
        }
            
        if (!mouseDown && clickPoint !== null && child.checkCollision(clickPoint)) {
          const idx = selecting.indexOf(child)
          // child.select(!child.isSelected);
          if (idx === -1) {
            selecting.push(child);
          } else {
            selecting.splice(idx, 1);
          }
          break;
        }
      }
    }
  } else {
    for (let index = 0; index < childrenCount; index++) {
      const child = children[index];
      const [colliding1, selecting1] = collisionCheck(child, movePoint, nested, selectTop, top, clickPoint);
      colliding = colliding.concat(colliding1);
      selecting = selecting.concat(selecting1);

      if (child.checkCollision(movePoint) && !colliding.includes(child)) {
        colliding.push(child);
      }
          
      if (!mouseDown && clickPoint !== null && child.checkCollision(clickPoint) && !selecting.includes(child)) {
        // child.select(!child.isSelected);
        selecting.push(child);
      }
    }
  }

  return [colliding, selecting];
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
  const [colliding, selecting] = collisionCheck(screen, point, nested, selectTop, null, mouseDownPoint);
  mouseDownPoint = null;
  if (selectRect !== null) {
    screen.children.forEach((_child) => {
      if (_child.type === ElementType.Square) {
        const child = <CanvasSquareElement>_child;
        if (selectRect!.point1.x.valueOf() <= child.point1.x.valueOf() && selectRect!.point1.y.valueOf() <= child.point1.y.valueOf() && selectRect!.point2.x.valueOf() >= child.point2.x.valueOf() && selectRect!.point2.y.valueOf() >= child.point2.y.valueOf()) {
          if (!selecting.includes(child)) {
            selecting.push(child);
            console.log('select this');
          }
        } else if (selecting.includes(child)) {
          selecting.splice(selecting.indexOf(child), 1);
        }
      }
    });
  }

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

  screen.render(context, colliding, selecting);
  if (selectRect) {
    selectRect.render(context, colliding, selecting);
  }

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