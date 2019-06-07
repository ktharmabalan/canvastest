import {
  Point,
  ElementType,
  CanvasSquareElement,
  CanvasLineElement,
  CanvasCircleElement,
  CanvasScreen,
  ReticleElement,
  CanvasElement,
  CanvasSelectSquareElement,
  MoveType,
  CanvasPolygonElement,
} from './element/element';
import {
  clamp,
  pointDistance,
  circleCollision,
  circlePointCollision,
} from './utils/utils';

const app = <HTMLDivElement>document.getElementById('app');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');

const elementContainer = <HTMLDivElement>(
  document.getElementById('element-container')
);
const elements = ['square', 'circle'];

const subContainer = <HTMLUListElement>document.createElement('ul');

let elementToInsert: string | null = null;
let mouseDownPoint: Point | null = null;
let eventTarget: Element | null = null;

const liClickEvent = (mEvent: MouseEvent) => {
  eventTarget = mEvent.target as Element;
  const { id } = eventTarget;
  eventTarget.className += 'selected';
  elementToInsert = id;
  mouseDownPoint = null;
};

let listElement: HTMLLIElement;
elements.forEach((element) => {
  listElement = document.createElement('li');
  listElement.id = element;
  listElement.textContent = element[0].toUpperCase();
  listElement.addEventListener('click', liClickEvent);
  subContainer.appendChild(listElement);
});
elementContainer.appendChild(subContainer);

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
const ratio = width >= height ? width / height : height / width;
// const screen = new CanvasScreen(ElementType.Square, width - 150 * ratio, height - 150, new Point(50 * ratio, 50));
const origin = new Point(0, 0);
const screen = new CanvasScreen(
  ElementType.Square,
  origin,
  screenWidth,
  screenHeight,
);
// let line = new CanvasLineElement(ElementType.Line, origin, new Point(width, height));
// screen.addChild(line);

// // Create Reticle
const centerX = width / 2;
const centerY = height / 2;
const length = 50;
// const reticle = new ReticleElement(ElementType.Reticle, origin);
// reticle.addChild(new CanvasLineElement(ElementType.Line, new Point(centerX - length, centerY), new Point(centerX + length, centerY)));
// reticle.addChild(new CanvasLineElement(ElementType.Line, new Point(centerX, centerY - length), new Point(centerX, centerY + length)));

const baseRadius = length * 2;
// const circle = new CanvasCircleElement(ElementType.Circle, new Point(centerX, centerY), baseRadius);
// circle.addChild(reticle);
// screen.addChild(circle);

// const mouseCircle = new CanvasCircleElement(ElementType.Circle, new Point(centerX, centerY), 20);
// screen.addChild(mouseCircle);

let nested = false;
const rectWidth = 150;
let rects: CanvasSquareElement[] = [];
// for (let index = 0; index < 5; index++) {
//   if (nested) {
//     rects.push(new CanvasSquareElement(ElementType.Square, new Point(screen.point1.x + 50 * index, screen.point1.y + 50 * index), rectWidth, rectWidth));
//   } else {
//     screen.addChild(new CanvasSquareElement(ElementType.Square, new Point(screen.point1.x + rectWidth * (index + 1), screen.point1.y + 50 * (index + 1)), rectWidth, rectWidth));
//     // rect = new CanvasSquareElement(ElementType.Square, rectWidth, rectWidth, new Point(screen.point1.x + 50 + (rectWidth + 20) * index, screen.point1.y + 50 + (rectWidth + 20) * index));
//   }
// }

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

// Circle
// screen.addChild(new CanvasCircleElement(ElementType.Circle, new Point(screen.point1.x + 500, screen.point1.x + 500), rectWidth / 2));

// Polygon
screen.addChild(
  new CanvasPolygonElement(
    ElementType.Polygon,
    new Point(screen.point1.x + 500, screen.point1.x + 500),
    3,
  ),
);

let selecting: CanvasElement[] = [];
let dragSelect: CanvasElement[] = [];

const drawBoundingBox = (): CanvasSelectSquareElement | null => {
  // console.log('draw', selecting.length, selecting);
  if (selecting.length) {
    // console.log('inside');
    let minX: number | null = null;
    let maxX: number | null = null;
    let minY: number | null = null;
    let maxY: number | null = null;

    let width = 0;
    let height = 0;

    selecting.forEach((element) => {
      if ([ElementType.Square, ElementType.Circle].includes(element.type)) {
        const child = element;
        const [point1, point2] = child.boundingBox;
        if (minX === null || point1.x < minX) minX = point1.x;
        if (minX === null || point2.x < minX) minX = point2.x;
        if (maxX === null || point1.x > maxX) maxX = point1.x;
        if (maxX === null || point2.x > maxX) maxX = point2.x;

        if (minY === null || point1.y < minY) minY = point1.y;
        if (minY === null || point2.y < minY) minY = point2.y;
        if (maxY === null || point1.y > maxY) maxY = point1.y;
        if (maxY === null || point2.y > maxY) maxY = point2.y;

        if (minX !== null && maxX !== null && minY !== null && maxY !== null) {
          width = maxX - minX;
          height = maxY - minY;
        }
      }
    });

    return new CanvasSelectSquareElement(
      ElementType.Square,
      new Point(minX!, minY!),
      width,
      height,
    );
  }
  return null;
};

const keyPressed: number[] = [];
const keyToListen: number[] = [16];
const keyMap = {
  shift: 16,
};

let mouseX = width * 10;
let mouseY = height * 10;

let mouseDown = false;
let temp: Point | null = null;

let drawPoint: Point | null = null;
let selectRect: CanvasSelectSquareElement | null = null;
let dragging = false;
let collidedElement: CanvasElement | null = null;
let collisionResult: [CanvasElement, number, number] | null = null;
let moveCoords: { x: number; y: number } | null = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (event) => {
  // console.log('mousedown');
  // console.log(event);
  const { offsetX: x, offsetY: y } = event;
  temp = new Point(x, y);
  mouseDown = true;
  mouseX = x;
  mouseY = y;
  moveCoords = { x, y };

  selectRect = null;

  if (!keyPressed.includes(keyMap.shift)) {
    selecting = [];
  } else {
    drawPoint = new Point(mouseX, mouseY);
  }
});

let drawingRect: CanvasSelectSquareElement | null = null;
const mouseUp = (event: MouseEvent | null = null) => {
  mouseDown = false;
  mouseDownPoint = null;
  if (temp !== null && !dragging) {
    mouseDownPoint = temp;
    temp = null;
  }
  moveCoords = null;
  mouseX = width * 10;
  mouseY = height * 10;

  // if (drawPoint !== null && event !== null) {
  //   // selectRect = new CanvasSelectSquareElement(ElementType.Square, 0, 0, drawPoint, new Point(event.offsetX, event.offsetY));
  //   // console.log(selectRect);
  // }

  selectRect = null;
  drawPoint = null;
  collidedElement = null;
  collisionResult = null;
  dragging = false;
  if (dragSelect.length) {
    selecting = selecting.concat(dragSelect);
  }

  // if (selecting.length) {
  //   drawingRect = drawBoundingBox();
  // }
  // new CanvasSelectSquareElement(ElementType.Square, 0, 0, drawPoint, new Point(event.offsetX, event.offsetY))
  // const drawingBox = drawBoundingBox();
};

canvas.addEventListener('mouseup', (event) => {
  event.stopPropagation();
  mouseUp(event);
});

document.addEventListener('mouseup', () => {
  mouseUp();
});

// document.body.addEventListener('mousemove', (event) => {
canvas.addEventListener('mousemove', (event) => {
  // console.log(event);
  const { x, y } = event;
  // const { movementX, movementY } = event;
  // console.log(movementX, movementY);
  if (mouseDown) {
    dragging = true;
  }

  if (moveCoords !== null) {
    moveCoords = { x, y };
  }

  // console.log('move');
  mouseX = event.offsetX;
  mouseY = event.offsetY;
  // mouseX = clamp(event.offsetX, screen.point1.x + 20, screen.point2.x - 20 + 50 * ratio);
  // mouseY = clamp(event.offsetY, screen.point1.y + 20, screen.point2.y - 20 + 50);

  if (drawPoint !== null && event !== null) {
    let minWidth = event.offsetX - drawPoint.x;
    let minHeight = event.offsetY - drawPoint.y;

    // if (minWidth < 0) minWidth *= 1;
    // if (minHeight < 0) minHeight *= 1;
    // console.log(drawPoint, { x: event.offsetX, y: event.offsetY });
    if (selectRect === null) {
      selectRect = new CanvasSelectSquareElement(
        ElementType.Square,
        drawPoint,
        minWidth,
        minHeight,
      );
    } else {
      selectRect.updateSize({ width: minWidth, height: minHeight });
    }
    // let minX: Number | null = null;
    // let maxX: Number | null = null;
    // let minY: Number | null = null;
    // let maxY: Number | null = null;

    // let width = 0;
    // let height = 0;

    //   const [point1, point2] = child.boundingBox;
    //   if (minX === null || point1.x.valueOf() < minX) minX = point1.x;
    //   if (minX === null || point2.x.valueOf() < minX) minX = point2.x;
    //   if (maxX === null || point1.x.valueOf() > maxX) maxX = point1.x;
    //   if (maxX === null || point2.x.valueOf() > maxX) maxX = point2.x;

    //   if (minY === null || point1.y.valueOf() < minY) minY = point1.y;
    //   if (minY === null || point2.y.valueOf() < minY) minY = point2.y;
    //   if (maxY === null || point1.y.valueOf() > maxY) maxY = point1.y;
    //   if (maxY === null || point2.y.valueOf() > maxY) maxY = point2.y;
    //   if (minX !== null && maxX !== null && minY !== null && maxY !== null) {
    //     width = maxX.valueOf() - minX.valueOf();
    //     height = maxY.valueOf() - minY.valueOf();
    //   }

    // return new CanvasSelectSquareElement(ElementType.Square, new Point(minX!, minY!), width, height);
    // selectRect = new CanvasSelectSquareElement(ElementType.Square, drawPoint, event.clientX - drawPoint.x.valueOf(),  event.clientY - drawPoint.y.valueOf());
    // console.log(selectRect);
  }
});

window.addEventListener('mouseleave', (event) => {
  mouseX = width * 10;
  mouseY = height * 10;
});

document.addEventListener('keydown', (event) => {
  // console.log(event.keyCode);
  if (
    keyToListen.includes(event.keyCode) &&
    !keyPressed.includes(event.keyCode)
  ) {
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

const speed = 0.1;
const offset = 0.5;
const baseAlpha = 0.5;

let angle = 0;
let y = 0;
let x = 0;
let radius = baseRadius;

const collisionCheck = (
  element: CanvasElement,
  movePoint: Point,
  nested: Boolean,
  selectTop: Boolean = false,
  top: CanvasElement | null,
  clickPoint: Point | null,
): [CanvasElement[], CanvasElement[]] => {
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
          const [colliding1, selecting1] = collisionCheck(
            child,
            movePoint,
            nested,
            selectTop,
            top,
            clickPoint,
          );
          colliding = colliding.concat(colliding1);
          selecting = selecting.concat(selecting1);

          // if (top !== null && top !== element) {
          //   element.select(false);
          // }
          if (
            !mouseDown &&
            clickPoint !== null &&
            child.checkCollision(clickPoint)
          ) {
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
          if (
            child.checkCollision(movePoint) &&
            !colliding.length &&
            !colliding.includes(child)
          ) {
            colliding.push(child);
          }
        }
      } else {
        if (
          !mouseDown &&
          clickPoint !== null &&
          element.checkCollision(clickPoint)
        ) {
          element.select(!element.isSelected);
        }
      }
    } else {
      // if (keyPressed.includes(keyMap.shift))

      for (let index = childrenCount - 1; index >= 0; index--) {
        const child = children[index];

        if (
          child.checkCollision(movePoint) &&
          !colliding.length &&
          !colliding.includes(child)
        ) {
          colliding.push(child);
        }

        if (clickPoint !== null && child.checkCollision(clickPoint)) {
          if (!mouseDown) {
            const idx = selecting.indexOf(child);
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
    }
  } else {
    for (let index = 0; index < childrenCount; index++) {
      const child = children[index];
      const [colliding1, selecting1] = collisionCheck(
        child,
        movePoint,
        nested,
        selectTop,
        top,
        clickPoint,
      );
      colliding = colliding.concat(colliding1);
      selecting = selecting.concat(selecting1);

      if (child.checkCollision(movePoint) && !colliding.includes(child)) {
        colliding.push(child);
      }

      if (
        !mouseDown &&
        clickPoint !== null &&
        child.checkCollision(clickPoint) &&
        !selecting.includes(child)
      ) {
        // child.select(!child.isSelected);
        selecting.push(child);
      }
    }
  }

  return [colliding, selecting];
};

const collisionOnlyCheck = (
  element: CanvasElement,
  clickPoint: Point,
): [CanvasElement, number, number] | null => {
  const children = element.children;
  const childrenCount = children.length;

  let x = 0;
  let y = 0;
  let colliding: [CanvasElement, number, number] | null = null;

  for (let index = childrenCount - 1; index >= 0; index--) {
    const child = children[index];
    // if ([ElementType.Square, ElementType.Circle].includes(element.type)) {
    // if (child.checkCollision(clickPoint) && colliding === null && child.type === ElementType.Square && child !== screen) {
    if (
      child.checkCollision(clickPoint) &&
      colliding === null &&
      [ElementType.Square, ElementType.Circle].includes(child.type) &&
      child !== screen
    ) {
      const cElement: CanvasElement = child;
      x = clickPoint.x - cElement.point1.x;
      y = clickPoint.y - cElement.point1.y;
      colliding = [cElement, x, y];
      // console.log(x, y);
      break;
    }
  }

  return colliding;
};

let selectTop = true;
// selectTop
//    nested: select the last descendent of a element
//    else: select all decendents of an element
// else
//   nested

const moveMap = [
  'None',
  'Up',
  'UpRight',
  'Right',
  'DownRight',
  'Down',
  'DownLeft',
  'Left',
  'UpLeft',
];

const render = () => {
  const point = new Point(mouseX, mouseY);
  // if (mouseDownPoint !== null) {
  //   point = mouseDownPoint;
  // }

  // screen.checkCollision(point);

  // Dragging
  if (dragging && temp && moveCoords && !keyPressed.includes(keyMap.shift)) {
    // if (!collidedElement) {
    if (!collisionResult) {
      // collisionResult = collisionOnlyCheck(screen, temp);
      collisionResult = collisionOnlyCheck(
        screen,
        new Point(moveCoords.x, moveCoords.y),
      );
      // console.log(collisionResult);
      // [collidedElement,] = collisionResult!;
    }

    if (collisionResult) {
      // console.log(collidedElement.offset);
      let movement = MoveType.None;
      let dx: number = 0;
      let dy: number = 0;

      let [, x, y] = collisionResult;
      if (collidedElement === null) {
        [collidedElement, x, y] = collisionResult;
      }
      dx = moveCoords.x - (collidedElement!.point1.x + x);
      dy = moveCoords.y - (collidedElement!.point1.y + y);

      let xOffset = 1;
      let yOffset = 1;

      if (dx > 0 && dy > 0) {
        movement = MoveType.DownLeft;
        yOffset *= -1;
      } else if (dx < 0 && dy > 0) {
        movement = MoveType.DownRight;
        yOffset *= -1;
        xOffset *= -1;
      } else if (dx === 0 && dy > 0) {
        movement = MoveType.Down;
        yOffset *= -1;
      } else if (dx === 0 && dy < 0) {
        movement = MoveType.Up;
      } else if (dx > 0 && dy < 0) {
        movement = MoveType.UpLeft;
      } else if (dx < 0 && dy < 0) {
        movement = MoveType.UpRight;
        xOffset *= -1;
      } else if (dx < 0 && dy === 0) {
        movement = MoveType.Left;
      } else if (dx > 0 && dy === 0) {
        movement = MoveType.Right;
        xOffset *= -1;
      }
      // console.log(collidedElement === screen);
      // console.log(dx, dy);
      // console.log(dx * xOffset, dy * yOffset);

      collidedElement.updatePoint(dx, dy);
      // collidedElement.updateOffset(dx * xOffset, dy * yOffset);
      // // console.log(moveMap[movement], xOffset * dx, yOffset * dy);
    }
    // console.log('dragging', temp, selecting.length);

    // console.log(collided);
    // const collidedElement = new CanvasSelectSquareElement(ElementType.Square, 0, 0, collided.boundingBox[0], collided.boundingBox[1]);
    // collidedElement.render(context, colliding, selecting.concat(dragSelect));
  }

  // Check point collision with children of screen
  const [colliding] = collisionCheck(
    screen,
    point,
    nested,
    selectTop,
    null,
    mouseDownPoint,
  );
  // , selecting1
  dragSelect = [];

  if (selectRect !== null) {
    let minX = selectRect!.point1.x;
    let minY = selectRect!.point1.y;
    let maxX = minX + selectRect!.minWidth;
    let maxY = minY + selectRect!.minHeight;

    if (selectRect!.minWidth < 0) {
      minX = selectRect!.minWidth + minX;
      maxX = selectRect!.point1.x;
    }

    if (selectRect!.minHeight < 0) {
      minY = selectRect!.minHeight + minY;
      maxY = selectRect!.point1.y;
    }

    screen.children.forEach((_child) => {
      if (_child.type === ElementType.Square) {
        const child = <CanvasSquareElement>_child;
        let cMinX = child!.point1.x;
        let cMinY = child!.point1.y;
        let cMaxX = cMinX + child!.minWidth;
        let cMaxY = cMinY + child!.minHeight;

        if (child!.minWidth < 0) {
          cMinX = child!.minWidth + cMinX;
          cMaxX = child!.point1.x;
        }

        if (child!.minHeight < 0) {
          cMinY = child!.minHeight + cMinY;
          cMaxY = child!.point1.y;
        }

        if (minX <= cMinX && minY <= cMinY && maxX >= cMaxX && maxY >= cMaxY) {
          if (!selecting.includes(child)) {
            if (!dragSelect.includes(child)) {
              dragSelect.push(child);
            } else {
              selecting.splice(selecting.indexOf(child), 1);
            }
            // console.log('select this');
          }
        }
      }
    });
  }

  const allSelected = selecting.concat(dragSelect);
  // && !allSelected.length
  if (elementToInsert && mouseDownPoint) {
    // console.log(elementToInsert);
    if (elementToInsert === 'square') {
      screen.addChild(
        new CanvasSquareElement(
          ElementType.Square,
          new Point(mouseDownPoint.x, mouseDownPoint.y),
          rectWidth,
          rectWidth,
        ),
      );
    } else if (elementToInsert === 'circle') {
      screen.addChild(
        new CanvasCircleElement(
          ElementType.Circle,
          new Point(mouseDownPoint.x, mouseDownPoint.y),
          rectWidth / 2,
        ),
      );
    }

    elementToInsert = null;
    if (eventTarget) {
      eventTarget.className = eventTarget.className.replace('selected', '');
      eventTarget = null;
    }
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

  // Render element
  screen.render(context, colliding, allSelected);

  // Render highlight box
  if (selectRect) {
    selectRect.render(context, colliding, allSelected);
  }

  // Render box for containing selected elements
  if (selecting.length) {
    drawingRect = drawBoundingBox();
    if (drawingRect) {
      drawingRect.render(context, colliding, allSelected);
    }
  }

  mouseDownPoint = null;
  // angle += speed;
  requestAnimationFrame(() => {
    render();
  });
};

render();

// setTimeout(() => {
//   screen.removeChild(line);
//   screen.render(context);
// }, 1000);
