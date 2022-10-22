import { Dot } from "../../../types/types";
import Figure from "./FigureHandler";

class Circle extends Figure {
  draw = (context: CanvasRenderingContext2D, point: Dot) => {
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    context!.fillStyle = "red";
    context.fill();
    context.stroke();
    context.closePath();
  };
}

const circle = new Circle();
export default circle;
