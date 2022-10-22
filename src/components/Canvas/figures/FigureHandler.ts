import { Dot } from "../../../types/types";

abstract class Figure {
  abstract draw(context: CanvasRenderingContext2D, start: Dot, end: Dot): void;
}

export default Figure;
