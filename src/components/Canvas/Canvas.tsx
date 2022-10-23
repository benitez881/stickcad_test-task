import React, { SyntheticEvent } from "react";
import { Dot, Line } from "../../types/types";
import styles from "./Canvas.module.scss";
import lineDrawer from "./figures/LineDrawer";
import circleDrawer from "./figures/CircleDrawer";
import intersect from "./figures/Intersect";

type Props = Object;
type State = {
  isDrawing: boolean;
  start: Dot;
  end: Dot;
  lines: Line[];
  linesScaled: Line[];
};

class Canvas extends React.Component<Props, State> {
  canvas: React.MutableRefObject<null>;
  state: State;
  constructor(props: Props) {
    super(props);
    this.canvas = React.createRef();
    this.state = {
      isDrawing: false,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      lines: [],
      linesScaled: [],
    };
  }

  componentDidUpdate(): void {
    if (!this.canvas.current) return;
    const current = this.canvas.current as HTMLCanvasElement;
    const ctx = current.getContext("2d") as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, current.width, current.height);
    lineDrawer.draw(ctx, this.state.start, this.state.end);
    if (this.state.lines.length > 0) {
      this.state.lines.forEach((item) => {
        const { start: startOld, end: endOld } = item;
        lineDrawer.draw(ctx, startOld, endOld);
        const allLines = [
          ...this.state.linesScaled,
          { start: this.state.start, end: this.state.end },
        ];
        const intersectPoints = intersect.getPoints(allLines);
        intersectPoints.forEach((point) => {
          if (!point) return;
          circleDrawer.draw(ctx, point);
        });
      });
    }
  }

  handleMouseMove = (e: SyntheticEvent): void => {
    const mouseEvent = e.nativeEvent as MouseEvent;
    if (!this.state.isDrawing) return;
    this.setState(() => ({
      end: { x: mouseEvent.offsetX, y: mouseEvent.offsetY },
    }));
  };

  handleMouseClick = (e: SyntheticEvent): void => {
    const mouseEvent = e.nativeEvent as MouseEvent;
    if (!this.state.isDrawing) {
      this.setState(() => ({
        isDrawing: true,
        start: {
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY,
        },
        end: {
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY,
        },
      }));
    } else {
      this.setState(() => ({
        isDrawing: false,
        start: {
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY,
        },
        end: {
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY,
        },
      }));
      const newLine = {
        start: this.state.start,
        end: this.state.end,
      } as unknown as Line;
      this.setState(() => ({
        lines: [...this.state.lines, newLine],
        linesScaled: [...this.state.linesScaled, newLine],
      }));
    }
  };

  onCollapse = (): void => {
    let startTime: null | number = null;
    const duration = 3000;
    requestAnimationFrame((timestamp) =>
      this.collapse.call(this, timestamp, startTime, duration)
    );
  };

  collapse = (
    timestamp: number,
    startTime: number | null,
    duration: number
  ): void => {
    if (!startTime) {
      startTime = timestamp;
    }
    // if time more than duration, set default values
    if (timestamp - startTime > duration) {
      this.setState(() => ({
        lines: [],
        linesScaled: [],
      }));
      return;
    }
    //
    const coefficient = 1 - (timestamp - startTime) / duration / 10;
    const lines = this.state.lines.map((line) => {
      if (!line.mid) {
        const x = (line.start.x + line.end.x) / 2;
        const y = (line.start.y + line.end.y) / 2;
        line.mid = { x, y };
      }
      return line;
    });
    const linesScaled = this.state.lines.map((line) => {
      if (!line.mid) return line;
      // calculate coordinated of points, considering coefficient
      line.start.x *= coefficient;
      line.start.y *= coefficient;
      line.end.x *= coefficient;
      line.end.y *= coefficient;
      // calculate diff between start line mid and calculated line mid
      const itemMidX = (line.start.x + line.end.x) / 2;
      const itemMidY = (line.start.y + line.end.y) / 2;
      const midDiffX = line.mid.x - itemMidX;
      const midDiffY = line.mid.y - itemMidY;
      // add diff to points
      line.start.x += midDiffX;
      line.start.y += midDiffY;
      line.end.x += midDiffX;
      line.end.y += midDiffY;
      return line;
    });
    this.setState(() => ({
      lines,
      linesScaled,
    }));
    requestAnimationFrame((timestamp) =>
      this.collapse.call(this, timestamp, startTime, duration)
    );
  };

  render(): React.ReactNode {
    return (
      <div className={styles.canvas__container}>
        <canvas
          className={styles.canvas__field}
          ref={this.canvas}
          onClick={this.handleMouseClick}
          onMouseMove={this.handleMouseMove}
          width="700"
          height="400"
        />
        <button className={styles.canvas__button} onClick={this.onCollapse}>
          Collapse Lines
        </button>
      </div>
    );
  }
}

export default Canvas;
