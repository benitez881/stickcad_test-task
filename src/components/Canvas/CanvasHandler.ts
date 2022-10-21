import { Dot, Line } from "../../types/types";

class CanvasHandler {
  intersect = (firstLine: Line, secondLine: Line) => {
    const { start, end } = firstLine;
    const { start: start2, end: end2 } = secondLine;

    const { x: x1, y: y1 } = start;
    const { x: x2, y: y2 } = end;
    const { x: x3, y: y3 } = start2;
    const { x: x4, y: y4 } = end2;
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    if (denominator === 0) {
      return false;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }

    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    return { x, y };
  };
  drawLine = (context: CanvasRenderingContext2D, start: Dot, end: Dot) => {
    context?.beginPath();
    context?.moveTo(start.x, start.y);
    context?.lineTo(end.x, end.y);
    context?.stroke();
    context?.closePath();
  };
  drawCircle = (context: CanvasRenderingContext2D, point: Dot) => {
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    context!.fillStyle = "red";
    context.fill();
    context.stroke();
    context.closePath();
  };
}

const canvasHandler = new CanvasHandler();
export default canvasHandler;
