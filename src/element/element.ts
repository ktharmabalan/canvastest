import { squarePointCollision, circlePointCollision, pointDistance } from "../utils/utils";

const drawMini = true;
const drawBoundSquare = false;

enum ElementType {
  Square,
  Circle,
  Line,
  Reticle,
}

enum MoveType {
  None,
  Up,
  UpRight,
  Right,
  DownRight,
  Down,
  DownLeft,
  Left,
  UpLeft,
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

interface CanvasInterface {
  type: ElementType;
  children: CanvasElement[],
  isColliding: Boolean,
  isSelected: Boolean,
  boundingBox: Point[],
  point1: Point,
  render: (context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) => void;
  addChild: (child: CanvasElement) => void;
  removeChild: (child: CanvasElement) => void;
  checkCollision: (point: Point) => Boolean;
  select: (selected: Boolean) => void;
  updatePoint: (x: number, y: number) => void;
}

class CanvasElement implements CanvasInterface {
  isSelected: Boolean;
  type: ElementType;
  boundingBox: Point[];
  point1: Point;
  children: CanvasElement[];
  isColliding: Boolean;
  minWidth: number;
  minHeight: number;

  constructor(type: ElementType, point: Point) {
    this.point1 = point;
    this.type = type;
    this.children = [];
    this.isColliding = false;
    this.boundingBox = [];
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    // console.log(`Called from ${ElementType[this.type]}`)
    this.children.forEach((child) => {
      child.render(context, coliding, selecting);
    });
  }

  addChild(child: CanvasElement) : void {
    this.children.push(child);
  };

  removeChild(child: CanvasElement) : void {
    const idx = this.children.indexOf(child);
    this.children.splice(idx);
  };

  select(selected: Boolean) : void {
    this.isSelected = selected;
  }

  checkCollision(target: Point | CanvasElement) : Boolean {
    let coliding = false;
    if (target instanceof Point) {
      if (this instanceof CanvasBaseSquareElement) {
        coliding = squarePointCollision(target, this);
      } else if (this instanceof CanvasCircleElement) {
        coliding = circlePointCollision(target, this);
      }
    }
    return coliding;
  }

  updatePoint(x: number, y: number) {}

  drawBounding(context: CanvasRenderingContext2D) {
    if (drawMini) {
      context.strokeStyle = 'blue';
      context.lineWidth = 2;
      const smallBoxSize = 10;
      const topLeft = { x: this.boundingBox[0].x, y: this.boundingBox[0].y };
      const topRight = { x: this.boundingBox[1].x, y: this.boundingBox[0].y };
      const bottomLeft = { x: this.boundingBox[0].x, y: this.boundingBox[1].y };
      const bottomRight = { x: this.boundingBox[1].x, y: this.boundingBox[1].y };
  
      const middleLeft = { x: this.boundingBox[0].x, y: (this.boundingBox[0].y + this.boundingBox[1].y) / 2 };
      const middleRight = { x: this.boundingBox[1].x, y: (this.boundingBox[0].y + this.boundingBox[1].y) / 2 };
      const topCenter = { x: (this.boundingBox[0].x + this.boundingBox[1].x) / 2, y: this.boundingBox[0].y };
      const bottomCenter = { x: (this.boundingBox[0].x + this.boundingBox[1].x) / 2, y: this.boundingBox[1].y };
  
      context.strokeRect(topLeft.x - smallBoxSize / 2, topLeft.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
      context.strokeRect(topRight.x - smallBoxSize / 2, topRight.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
      context.strokeRect(bottomLeft.x - smallBoxSize / 2, bottomLeft.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
      context.strokeRect(bottomRight.x - smallBoxSize / 2, bottomRight.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
  
      context.strokeRect(middleLeft.x - smallBoxSize / 2, middleLeft.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
      context.strokeRect(middleRight.x - smallBoxSize / 2, middleRight.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
      context.strokeRect(topCenter.x - smallBoxSize / 2, topCenter.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
      context.strokeRect(bottomCenter.x - smallBoxSize / 2, bottomCenter.y - smallBoxSize / 2, smallBoxSize, smallBoxSize);
    }
  }
}

class CanvasBaseSquareElement extends CanvasElement {
  minWidth: number;
  minHeight: number;

  constructor(type: ElementType, point: Point, minWidth: number, minHeight: number) {
    super(type, point);
    this.minWidth = minWidth;
    this.minHeight = minHeight;

    // if (point1 && point2) {
    //   this.point1 = point1;
    //   this.point2 = point2;
    // } else if (point1 && !point2) {
    //   this.point1 = point1;
    //   this.point2 = new Point(this.point1.x + minWidth, this.point1.y + minHeight);
    // } else {
    //   this.point1 = new Point(0, 0);
    //   this.point2 = new Point(this.point1.x + minWidth, this.point1.y + minHeight);
    // }

    // prev
    // const minX: number = Math.min(this.point1.x, this.point1.x + minWidth);
    // const maxX: number = Math.max(this.point1.x, this.point1.x + minWidth);
    // const minY: number = Math.min(this.point1.y, this.point1.y + minHeight);
    // const maxY: number = Math.max(this.point1.y, this.point1.y + minHeight);

    // this.point1 = new Point(minX, minY);
    // this.boundingBox = [this.point1, new Point(maxX, maxY)];

    this.boundingBox = [this.point1, new Point(this.point1.x + minWidth,  this.point1.y + minHeight)];
  }

  updateSize(size: { width?: number, height?: number }) {
    if (size.width) {
      this.minWidth = size.width;
    }
    if (size.height) {
      this.minHeight = size.height;
    }

    this.boundingBox = [this.point1, new Point(this.point1.x + this.minWidth, this.point1.y + this.minHeight)];
  }

  updatePoint(x: number, y: number) {
    let _x = this.point1.x + x;
    let _y = this.point1.y + y;
    this.point1.x = _x;
    this.point1.y = _y;
    // this.minWidth = _x + this.minWidth;
    // this.minHeight = _y + this.minHeight;
    this.boundingBox = [this.point1, new Point(_x + this.minWidth, _y + this.minHeight)];
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    super.render(context, coliding, selecting)
  }
}

class CanvasSquareElement extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    // context.beginPath();
    // context.moveTo(this.point1.x, this.point1.y);
    // context.lineTo(this.point2.x, this.point1.y);
    // context.lineTo(this.point2.x, this.point2.y);
    // context.lineTo(this.point1.x, this.point2.y);
    // context.lineTo(this.point1.x, this.point1.y);
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    // context.stroke();
    context.fillStyle = 'rgba(255, 255, 255, 0)';
    // context.fillRect(this.point1.x, this.point1.y, pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));

    // if (this.isSelected) {
    if (selecting.includes(this)) {
      context.strokeStyle = 'blue';
      // context.fillStyle = 'blue';
      // context.fillRect(this.point1.x, this.point1.y, pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));
    }
    // context.lineWidth = 1;
    // context.stroke();
    // if (coliding.includes(this)) {
    //   context.fillStyle = 'white';
    // }

    context.fillRect(this.point1.x, this.point1.y, this.minWidth, this.minHeight);
    context.strokeRect(this.point1.x, this.point1.y, this.minWidth, this.minHeight);
    
    if (drawBoundSquare) {
      context.lineWidth = 2;
      context.strokeStyle = 'blue';
      context.strokeRect(this.point1.x, this.point1.y, this.minWidth, this.minHeight);
    }
    super.drawBounding(context);
    // context.fillRect(this.point1.x, this.point1.y, pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));
    // context.strokeRect(this.point1.x, this.point1.y, pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));

    super.render(context, coliding, selecting);
  }
}

class CanvasSelectSquareElement extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    context.lineWidth = 1;
    // context.strokeStyle = 'white';
    // context.strokeStyle = 'rgba(121, 169, 250, 1)';
    context.strokeStyle = 'rgba(21, 69, 250, 1)';
    // context.fillStyle = 'rgba(255, 255, 255, .2)';
    // context.fillStyle = 'rgba(202, 218, 245, .5)';
    // context.fillStyle = 'rgba(163, 194, 247, .5)';
    context.fillStyle = 'rgba(121, 169, 250, .5)';

    context.fillRect(this.point1.x, this.point1.y, this.minWidth, this.minHeight);
    context.strokeRect(this.point1.x, this.point1.y, this.minWidth, this.minHeight);

    super.render(context, coliding, selecting);
  }
}

class CanvasScreen extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    // context.lineWidth = 1;
    // context.strokeStyle = 'black';
    context.fillStyle = 'rgba(242, 242, 242, 1)';
    context.fillRect(this.point1.x, this.point1.y, this.minWidth, this.minHeight);

    // if (this.isColliding) {
    // if (coliding.includes(this)) {
    //   context.lineWidth = 4;
    //   context.strokeStyle = 'green';
    //   context.strokeRect(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
    //   context.stroke();
    // }
    super.render(context, coliding, selecting);
  }
}

class CanvasLineElement extends CanvasElement {
  point2: Point;

  constructor(type: ElementType, point1: Point, point2: Point) {
    super(type, point1);
    // console.log(point1, point2);
    this.point2 = point2;
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    context.beginPath();
    context.strokeStyle = 'red';
    context.lineWidth = 1;
    // if (this.isColliding) {
    if (coliding.includes(this)) {
      context.strokeStyle = 'white';
      context.lineWidth = 2;
    }
    context.moveTo(this.point1.x, this.point1.y);
    context.lineTo(this.point2.x, this.point2.y);
    context.stroke();
    super.render(context, coliding, selecting);
  }

  updatePoint(x: number, y: number) : void {
    this.point1.x = this.point1.x + x;
    this.point1.y = this.point1.y + y;
    this.point2.x = this.point2.x + x;
    this.point2.y = this.point2.y + y;
  }
}

class CanvasCircleElement extends CanvasElement {
  radius: number;
  alpha: number;

  constructor(type: ElementType, point: Point, radius: number) {
    super(type, point);
    this.alpha = 1;
    this.radius = radius;
    
    this.boundingBox = [new Point(this.point1.x - radius, this.point1.y - radius), new Point(this.point1.x + radius,  this.point1.y + radius)];
  }

  updatePoint(x: number, y: number) : void {
    let _x = this.point1.x + x;
    let _y = this.point1.y + y;
    this.point1.x = _x;
    this.point1.y = _y;

    this.boundingBox = [new Point(_x - this.radius, _y - this.radius), new Point(_x + this.radius,  _y + this.radius)];
  }

  updateRadius(radius: number) : void {
    this.radius = radius;
  }

  updateAlpha(alpha: number) : void {
    this.alpha = alpha;
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    context.beginPath();
    context.arc(this.point1.x, this.point1.y, this.radius, 0, Math.PI * 2, false);
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    
    if (drawBoundSquare) {
      context.lineWidth = 2;
      context.strokeStyle = 'blue';
      context.strokeRect(this.boundingBox[0].x, this.boundingBox[0].y, this.boundingBox[1].x - this.boundingBox[0].x, this.boundingBox[1].y - this.boundingBox[0].y);
    }
    super.drawBounding(context);

    context.stroke();
    
    // context.fillStyle = 'white';
    // context.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    // context.fill();
    super.render(context, coliding, selecting)
  }
}

class ReticleElement extends CanvasElement {
  constructor(type: ElementType, point: Point) {
    super(type, point);
  }

  updatePoint(x: number, y: number) : void {
    this.children.forEach((child) => {
      (<CanvasLineElement>child).updatePoint(x, y);
    })
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    context.strokeStyle = 'white';
    super.render(context, coliding, selecting);
  }
}

export {
  MoveType,
  CanvasElement,
  ElementType,
  Point,
  CanvasScreen,
  CanvasLineElement,
  CanvasSquareElement,
  CanvasSelectSquareElement,
  CanvasCircleElement,
  ReticleElement,
};