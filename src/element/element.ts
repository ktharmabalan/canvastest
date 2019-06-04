import { squarePointCollision, circlePointCollision, pointDistance } from "../utils/utils";

enum ElementType {
  Square,
  Circle,
  Line,
  Reticle,
}

class Point {
  x: Number;
  y: Number;

  constructor(x: Number, y: Number) {
    this.x = x;
    this.y = y;
  }
}

interface CanvasInterface {
  type: ElementType;
  children: CanvasElement[],
  isColliding: Boolean,
  isSelected: Boolean,
  render: (context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) => void;
  addChild: (child: CanvasElement) => void;
  removeChild: (child: CanvasElement) => void;
  checkCollision: (point: Point) => Boolean;
  select: (selected: Boolean) => void;
}

class CanvasElement implements CanvasInterface {
  isSelected: Boolean;
  type: ElementType;
  children: CanvasElement[];
  isColliding: Boolean;
  minWidth: Number;
  minHeight: Number;

  constructor(type: ElementType) {
    this.type = type;
    this.children = [];
    this.isColliding = false;
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
        coliding = squarePointCollision(target, this).valueOf();
      } else if (this instanceof CanvasCircleElement) {
        coliding = circlePointCollision(target, this).valueOf();
      }
    }
    return coliding;
  }

}

class CanvasBaseSquareElement extends CanvasElement {
  minWidth: Number;
  minHeight: Number;
  point1: Point;
  point2: Point;

  constructor(type: ElementType, minWidth: Number, minHeight: Number, point1?: Point, point2?: Point) {
    super(type);
    this.minWidth = minWidth;
    this.minHeight = minHeight;

    if (point1 && point2) {
      this.point1 = point1;
      this.point2 = point2;
    } else if (point1 && !point2) {
      this.point1 = point1;
      this.point2 = new Point(this.point1.x.valueOf() + minWidth.valueOf(), this.point1.y.valueOf() + minHeight.valueOf());
    } else {
      this.point1 = new Point(0, 0);
      this.point2 = new Point(this.point1.x.valueOf() + minWidth.valueOf(), this.point1.y.valueOf() + minHeight.valueOf());
    }

    const minX: number = Math.min(this.point1.x.valueOf(), this.point2.x.valueOf());
    const maxX: number = Math.max(this.point1.x.valueOf(), this.point2.x.valueOf());
    const minY: number = Math.min(this.point1.y.valueOf(), this.point2.y.valueOf());
    const maxY: number = Math.max(this.point1.y.valueOf(), this.point2.y.valueOf());

    this.point1 = new Point(minX, minY);
    this.point2 = new Point(maxX, maxY);

    this.minWidth = maxX - minX;
    this.minHeight = maxY - minY;
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    super.render(context, coliding, selecting)
  }
}

class CanvasSquareElement extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    // context.beginPath();
    // context.moveTo(this.point1.x.valueOf(), this.point1.y.valueOf());
    // context.lineTo(this.point2.x.valueOf(), this.point1.y.valueOf());
    // context.lineTo(this.point2.x.valueOf(), this.point2.y.valueOf());
    // context.lineTo(this.point1.x.valueOf(), this.point2.y.valueOf());
    // context.lineTo(this.point1.x.valueOf(), this.point1.y.valueOf());
    context.lineWidth = 1;
    context.strokeStyle = 'white';
    // context.stroke();
    context.fillStyle = 'green';
    // context.fillRect(this.point1.x.valueOf(), this.point1.y.valueOf(), pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));

    // if (this.isSelected) {
    if (selecting.includes(this)) {
      context.strokeStyle = 'blue';
      // context.fillStyle = 'blue';
      // context.fillRect(this.point1.x.valueOf(), this.point1.y.valueOf(), pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));
    }
    // context.lineWidth = 1;
    // context.stroke();
    if (coliding.includes(this)) {
      context.fillStyle = 'white';
    }
    context.fillRect(this.point1.x.valueOf(), this.point1.y.valueOf(), this.point2.x.valueOf() - this.point1.x.valueOf(), this.point2.y.valueOf() - this.point1.y.valueOf());
    context.strokeRect(this.point1.x.valueOf(), this.point1.y.valueOf(), this.point2.x.valueOf() - this.point1.x.valueOf(), this.point2.y.valueOf() - this.point1.y.valueOf());
    // context.fillRect(this.point1.x.valueOf(), this.point1.y.valueOf(), pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));
    // context.strokeRect(this.point1.x.valueOf(), this.point1.y.valueOf(), pointDistance(this.point1, this.point2), pointDistance(this.point1, this.point2));

    super.render(context, coliding, selecting);
  }
}

class CanvasSelectSquareElement extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    context.lineWidth = 1;
    context.strokeStyle = 'white';
    context.fillStyle = 'rgba(255, 255, 255, .2)';

    context.fillRect(this.point1.x.valueOf(), this.point1.y.valueOf(), this.point2.x.valueOf() - this.point1.x.valueOf(), this.point2.y.valueOf() - this.point1.y.valueOf());
    context.strokeRect(this.point1.x.valueOf(), this.point1.y.valueOf(), this.point2.x.valueOf() - this.point1.x.valueOf(), this.point2.y.valueOf() - this.point1.y.valueOf());

    super.render(context, coliding, selecting);
  }
}

class CanvasScreen extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    // context.lineWidth = 1;
    // context.strokeStyle = 'black';
    context.fillStyle = 'black';
    context.fillRect(this.point1.x.valueOf(), this.point1.y.valueOf(), this.point2.x.valueOf(), this.point2.y.valueOf());
    // if (this.isColliding) {
    if (coliding.includes(this)) {
      context.lineWidth = 4;
      context.strokeStyle = 'green';
      context.strokeRect(this.point1.x.valueOf(), this.point1.y.valueOf(), this.point2.x.valueOf(), this.point2.y.valueOf());
      context.stroke();
    }
    super.render(context, coliding, selecting);
  }
}

class CanvasLineElement extends CanvasElement {
  point1: Point;
  point2: Point;

  constructor(type: ElementType, point1: Point, point2: Point) {
    super(type);
    // console.log(point1, point2);
    this.point1 = point1;
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
    context.moveTo(this.point1.x.valueOf(), this.point1.y.valueOf());
    context.lineTo(this.point2.x.valueOf(), this.point2.y.valueOf());
    context.stroke();
    super.render(context, coliding, selecting);
  }

  updatePoint(point: Point) : void {
    this.point1.x = this.point1.x.valueOf() + point.x.valueOf();
    this.point1.y = this.point1.y.valueOf() + point.y.valueOf();
    this.point2.x = this.point2.x.valueOf() + point.x.valueOf();
    this.point2.y = this.point2.y.valueOf() + point.y.valueOf();
  }
}

class CanvasCircleElement extends CanvasElement {
  radius: Number;
  minHeight: Number;
  point1: Point;
  alpha: Number;

  constructor(type: ElementType, radius: Number, point1?: Point) {
    super(type);
    this.alpha = 1;
    this.radius = radius;
    this.point1 = point1 || new Point(0, 0);
  }

  updatePoint(point: Point) : void {
    this.point1 = point;
  }

  updateRadius(radius: Number) : void {
    this.radius = radius;
  }

  updateAlpha(alpha: Number) : void {
    this.alpha = alpha;
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    context.beginPath();
    context.arc(this.point1.x.valueOf(), this.point1.y.valueOf(), this.radius.valueOf(), 0, Math.PI * 2, false);
    // context.strokeStyle = 'blue';
    // context.fillStyle = 'white';
    context.fillStyle = `rgba(255, 255, 255, ${this.alpha.valueOf()})`;
    // context.stroke();
    context.fill();
    super.render(context, coliding, selecting)
  }
}

class ReticleElement extends CanvasElement {
  constructor(type: ElementType) {
    super(type);
  }

  updatePoint(point: Point) : void {
    this.children.forEach((child) => {
      (<CanvasLineElement>child).updatePoint(point);
    })
  }

  render(context: CanvasRenderingContext2D, coliding: CanvasElement[], selecting: CanvasElement[]) : void {
    context.strokeStyle = 'white';
    super.render(context, coliding, selecting);
  }
}

export {
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