import React from "react";
import canvasHandler from "./CanvasHandler";
import { Line } from "../../types/types";
import styles from "./Canvas.module.scss";

const { useEffect, useRef, useState } = React;

const Canvas = () => {
  const canvas = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [lines, addLine] = useState<Line[]>([]);
  const [linesScaled, addLineScaled] = useState<Line[]>([]);

  useEffect(() => {
    if (!canvas.current) return;
    const current = canvas.current as HTMLCanvasElement;
    const ctx = current.getContext("2d") as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, current.width, current.height);
    canvasHandler.drawLine(ctx, start, end);
    if (lines.length > 0) {
      lines.forEach((item) => {
        const { start: startOld, end: endOld } = item;
        canvasHandler.drawLine(ctx, startOld, endOld);
        const allLines = [...linesScaled, { start, end }];
        const intersectPoints = allLines.flatMap((v, i) =>
          allLines.slice(i + 1).map((w) => canvasHandler.intersect(v, w))
        );

        intersectPoints.forEach((point) => {
          if (!point) return;
          canvasHandler.drawCircle(ctx, point);
        });
      });
    }
  }, [isDrawing, start, end, lines, linesScaled]);

  const mousemove = (e: any) => {
    if (!isDrawing) return;
    setEnd({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };

  const mouseHandler = (e: any) => {
    if (!isDrawing) {
      setIsDrawing(true);
      setStart({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });
      setEnd({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });
    } else {
      setIsDrawing(false);
      setStart({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });
      setEnd({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });
      const newLine = { start, end } as unknown as Line;
      addLine((lines) => [...lines, newLine]);
      addLineScaled((linesScaled) => [...linesScaled, newLine]);
    }
  };

  const onCollapse = () => {
    let startTime: null | number = null;
    const duration = 3000;
    requestAnimationFrame((timestamp) =>
      collapse.call(this, timestamp, startTime, duration)
    );
  };

  const collapse = (
    timestamp: number,
    startTime: number | null,
    duration: number
  ) => {
    if (!startTime) {
      startTime = timestamp;
    }
    // if time more than duration, set default values
    if (timestamp - startTime > duration) {
      addLine([]);
      addLineScaled([]);
      return;
    }
    //
    const coefficient = 1 - (timestamp - startTime) / duration / 10;

    addLine(
      lines.map((line) => {
        if (!line.mid) {
          const x = (line.start.x + line.end.x) / 2;
          const y = (line.start.y + line.end.y) / 2;
          line.mid = { x, y };
        }
        return line;
      })
    );
    addLineScaled(
      lines.map((line) => {
        if (!line.mid) return line;
        //
        line.start.x *= coefficient;
        line.start.y *= coefficient;
        line.end.x *= coefficient;
        line.end.y *= coefficient;
        //
        const itemMidX = (line.start.x + line.end.x) / 2;
        const itemMidY = (line.start.y + line.end.y) / 2;
        const midDiffX = line.mid.x - itemMidX;
        const midDiffY = line.mid.y - itemMidY;
        //
        line.start.x += midDiffX;
        line.start.y += midDiffY;
        line.end.x += midDiffX;
        line.end.y += midDiffY;
        return line;
      })
    );
    requestAnimationFrame((timestamp) =>
      collapse.call(this, timestamp, startTime, duration)
    );
  };

  return (
    <div className={styles.canvas__container}>
      <canvas
        className={styles.canvas__field}
        ref={canvas}
        onClick={mouseHandler}
        onMouseMove={mousemove}
      />
      <button className={styles.canvas__button} onClick={onCollapse}>
        Collapse Lines
      </button>
    </div>
  );
};

export default Canvas;