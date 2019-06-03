import { CanvasCircleElement, Point, CanvasSquareElement } from '../element/element';

// take value within min-max range, and represent its position by a number between 0 and 1
const normalize = (value: number, min: number, max: number) => {
  return (value - min) / (max - min);
}

// lerp = linear interpolation 
// convert normalized value into a value within a range
const lerp = (norm: number, min: number, max: number) => {
  return (max - min) * norm + min;
}

// map value in one range to a value on another
const map = (value: number, sourceMin: number, sourceMax: number, destMin: number, destMax: number) => {
  return lerp(normalize(value, sourceMin, sourceMax), destMin, destMax);
}

// Clamp value between min-max range
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
}

// Check if value is in range
const inRange = (value: number, min: number, max: number) => {
  return value >= Math.min(min, max) && value <= Math.max(min, max);
}

// caculate distance between two points
const pointDistance = (p1: Point, p2: Point) => {
  const dx = p2.x.valueOf() - p1.x.valueOf();
  const dy = p2.y.valueOf() - p2.y.valueOf();
  return Math.sqrt(dx * dx + dy * dy);
}

// // caculate distance between two points
// const distance = (d1: {x: number, y: number}, d2: {x: number, y: number}) => {
//   const dx = d1.x - d2.x;
//   const dy = d1.y - d2.y;
//   return Math.sqrt(dx * dx + dy * dy);
// }

// caculate distance between two points
const circleDistance = (d1: CanvasCircleElement, d2: CanvasCircleElement) : number => {
  const dx = d1.point1.x.valueOf() - d2.point1.x.valueOf();
  const dy = d1.point1.y.valueOf() - d2.point1.y.valueOf();
  return Math.sqrt(dx * dx + dy * dy);
}

const circleCollision = (c1: CanvasCircleElement, c2: CanvasCircleElement) : Boolean => {
  return circleDistance(c1, c2) <= c1.radius.valueOf() + c2.radius.valueOf();
}

const circlePointCollision = (point: Point, circle: CanvasCircleElement) : Boolean => {
  return pointDistance(point, circle.point1) < circle.radius;
}

const squarePointCollision = (point: Point, square: CanvasSquareElement) : Boolean => {
  return inRange(point.x.valueOf(), square.point1.x.valueOf(), square.point1.x.valueOf() + square.minWidth.valueOf()) && 
        inRange(point.y.valueOf(), square.point1.y.valueOf(), square.point1.y.valueOf() + square.minHeight.valueOf());
}

export {
  clamp,
  pointDistance,
  circleCollision,
  circlePointCollision,
  squarePointCollision,
}