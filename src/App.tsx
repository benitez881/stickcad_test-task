import { timeStamp } from "console";
import React from "react";
import "./App.css";

const { useEffect, useRef, useState } = React;

interface ILine {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  mid?: {
    x: number;
    y: number;
  };
}

function intersect(firstLine: ILine, secondLine: ILine) {
  const { start, end } = firstLine;
  const { start: start2, end: end2 } = secondLine;
  const x1 = start.x;
  const y1 = start.y;
  const x2 = end.x;
  const y2 = end.y;
  const x3 = start2.x;
  const y3 = start2.y;
  const x4 = end2.x;
  const y4 = end2.y;
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }

  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // Lines are parallel
  if (denominator === 0) {
    return false;
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);

  return { x, y };
}

const Canvas = () => {
  const canvas = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [lines, addLine] = useState<ILine[]>([]);
  const [linesScaled, addLineScaled] = useState<ILine[]>([]);

  // draw effect – each time isDrawing,
  // start or end change, automatically
  // redraw everything
  useEffect(() => {
    if (!canvas.current) return;
    const current = canvas.current as HTMLCanvasElement;

    // clear canvas
    const ctx = current.getContext("2d");
    ctx?.clearRect(0, 0, current.width, current.height);
    ctx?.beginPath();
    // draw the line
    ctx?.moveTo(start.x, start.y);
    ctx?.lineTo(end.x, end.y);
    ctx?.stroke();
    ctx?.closePath();
    if (lines.length > 0) {
      lines.forEach((item) => {
        const { start: startOld, end: endOld } = item;
        ctx?.beginPath();
        ctx?.moveTo(startOld.x, startOld.y);
        ctx?.lineTo(endOld.x, endOld.y);
        ctx?.stroke();
        ctx?.closePath();
        const allLines = [...linesScaled, { start, end }];
        const result = allLines.flatMap((v, i) =>
          allLines.slice(i + 1).map((w) => intersect(v, w))
        );
        const res = result.filter((item) => item !== false);
        res.forEach((item) => {
          if (!item) return;
          // Create sub-path
          ctx?.beginPath();
          ctx?.arc(item.x, item.y, 5, 0, 2 * Math.PI);
          ctx!.fillStyle = "red";
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
        });
      });
    }

    ctx?.stroke();
    ctx?.closePath();
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
      const array = { start, end } as unknown as ILine;
      addLine((lines) => [...lines, array]);
      addLineScaled((linesScaled) => [...linesScaled, array]);
    }
  };

  const onCollapse = (e: any) => {
    const current = canvas.current as unknown as HTMLCanvasElement;
    const ctx = current.getContext("2d");
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
    // console.log("timestamp", timestamp);
    // console.log("startTime", startTime);
    // console.log("duration", duration);
    if (!startTime) {
      startTime = timestamp;
      // console.log("startTime", startTime);
    }
    if (timestamp - startTime > duration) {
      addLine([]);
      addLineScaled([]);
      return;
    }
    const percent = (timestamp - startTime) / duration;
    addLine(
      lines.map((item) => {
        if (!item.mid) {
          const x = (item.start.x + item.end.x) / 2;
          const y = (item.start.y + item.end.y) / 2;
          item.mid = { x, y };
        }
        return item;
        // const k = (item.end.y - item.start.y) / (item.end.x - item.start.x);
      })
    );
    addLineScaled(
      lines.map((item) => {
        if (!item.mid) return item;
        item.start.x *= 1 - percent;
        item.start.y *= 1 - percent;
        item.end.x *= 1 - percent;
        item.end.y *= 1 - percent;
        const itemMidX = (item.start.x + item.end.x) / 2;
        const itemMidY = (item.start.y + item.end.y) / 2;
        const midDiffX = item.mid.x - itemMidX;
        const midDiffY = item.mid.y - itemMidY;
        item.start.x += midDiffX;
        item.start.y += midDiffY;
        item.end.x += midDiffX;
        item.end.y += midDiffY;
        return item;
      })
    );
    requestAnimationFrame((timestamp) =>
      collapse.call(this, timestamp, startTime, duration)
    );
  };

  return (
    <div>
      <canvas
        id="canvas"
        ref={canvas}
        onClick={mouseHandler}
        onMouseMove={mousemove}
        width="400"
        height="400"
        style={{ border: "2px solid red" }}
      />
      <button onClick={onCollapse}>Collapse Lines</button>
    </div>
  );
};

export default Canvas;
