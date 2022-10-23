import { Dot } from "../../../types/types";
import Figure from "./FigureHandler";

class CircleDrawer extends Figure {
  draw = (context: CanvasRenderingContext2D, point: Dot) => {
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    context!.fillStyle = "red";
    context.fill();
    context.stroke();
    context.closePath();
  };
}

const circleDrawer = new CircleDrawer();
export default circleDrawer;
