import { Dot } from "../../../types/types";
import Figure from "./FigureHandler";

class Line extends Figure {
  draw = (context: CanvasRenderingContext2D, start: Dot, end: Dot) => {
    context?.beginPath();
    context?.moveTo(start.x, start.y);
    context?.lineTo(end.x, end.y);
    context?.stroke();
    context?.closePath();
  };
}

const line = new Line();
export default line;
