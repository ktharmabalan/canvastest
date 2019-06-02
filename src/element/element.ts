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
  render: (context: CanvasRenderingContext2D) => void;
  addChild: (child: CanvasElement) => void;
  removeChild: (child: CanvasElement) => void;
  collided: (point: Point) => Boolean;
}

class CanvasElement implements CanvasInterface {
  type: ElementType;
  children: CanvasElement[];
  minWidth: Number;
  minHeight: Number;

  constructor(type: ElementType) {
    this.type = type;
    this.children = [];
  }

  render(context: CanvasRenderingContext2D) : void {
    // console.log(`Called from ${ElementType[this.type]}`)
    this.children.forEach((child) => {
      child.render(context);
    });
  }

  addChild(child: CanvasElement) : void {
    this.children.push(child);
  };

  removeChild(child: CanvasElement) : void {
    const idx = this.children.indexOf(child);
    this.children.splice(idx);
  };

  collided(point: Point) : Boolean {
    return false;
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
    this.point1 = point1 || new Point(0, 0);
    this.point2 = point2 || new Point(this.point1.x.valueOf() + minWidth.valueOf(), this.point1.y.valueOf() + minHeight.valueOf());
  }

  render(context: CanvasRenderingContext2D) : void {
    super.render(context)
  }

  collided(point: Point) : Boolean {
    return false;
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

  render(context: CanvasRenderingContext2D) : void {
    context.beginPath();
    context.moveTo(this.point1.x.valueOf(), this.point1.y.valueOf());
    context.lineTo(this.point2.x.valueOf(), this.point2.y.valueOf());
    context.strokeStyle = 'red';
    context.lineWidth = 5;
    context.stroke();
    // context.closePath();
    super.render(context);
  }

  updatePoint(point: Point) : void {
    this.point1.x = this.point1.x.valueOf() + point.x.valueOf();
    this.point1.y = this.point1.y.valueOf() + point.y.valueOf();
    this.point2.x = this.point2.x.valueOf() + point.x.valueOf();
    this.point2.y = this.point2.y.valueOf() + point.y.valueOf();
  }

  collided(point: Point) : Boolean {
    return false;
  }
}

class CanvasSquareElement extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D) : void {
    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.stroke();
    context.beginPath();
    context.moveTo(this.point1.x.valueOf(), this.point1.y.valueOf());
    context.lineTo(this.point2.x.valueOf(), this.point1.y.valueOf());
    context.lineTo(this.point2.x.valueOf(), this.point2.y.valueOf());
    context.lineTo(this.point1.x.valueOf(), this.point2.y.valueOf());
    context.lineTo(this.point1.x.valueOf(), this.point1.y.valueOf());
    super.render(context);
  }
}

class CanvasScreen extends CanvasBaseSquareElement {
  render(context: CanvasRenderingContext2D) : void {
    context.fillRect(this.point1.x.valueOf(), this.point1.y.valueOf(), this.point2.x.valueOf(), this.point2.y.valueOf());
    super.render(context);
  }
}

class CanvasCircleElement extends CanvasElement {
  radius: Number;
  minHeight: Number;
  point1: Point;

  constructor(type: ElementType, radius: Number, point1?: Point) {
    super(type);
    this.radius = radius;
    this.point1 = point1 || new Point(0, 0);
  }

  updatePoint(point: Point) : void {
    this.point1 = point;
  }

  render(context: CanvasRenderingContext2D) : void {
    context.beginPath();
    context.arc(this.point1.x.valueOf(), this.point1.y.valueOf(), this.radius.valueOf(), 0, Math.PI * 2, false);
    context.stroke();
    super.render(context)
  }

  collided(point: Point) : Boolean {
    return false;
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

  render(context: CanvasRenderingContext2D) : void {
    super.render(context);
  }

  collided(point: Point) : Boolean {
    return false;
  }
}

export {
  CanvasElement,
  ElementType,
  Point,
  CanvasScreen,
  CanvasLineElement,
  CanvasSquareElement,
  CanvasCircleElement,
  ReticleElement,
};