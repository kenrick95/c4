import { Board } from './board';

export class Utils {
  static drawCircle(context: CanvasRenderingContext2D, { x = 0, y = 0, r = 0, fill = '', stroke = '' }) {
    context.save();
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
  }
  /**
   * @see http://stackoverflow.com/a/11770000/917957
   * @static
   * @param context Canvas 2D Context
   * @param board   current board
   */
  static drawMask(board: Board) {
    const context = board.context;
    context.save();
    context.fillStyle = '#ddd';
    context.beginPath();
    let x, y;
    for (y = 0; y < Board.row; y++) {
      for (x = 0; x < Board.column; x++) {
        context.arc(75 * x + 100, 75 * y + 50, 25, 0, 2 * Math.PI);
        context.rect(75 * x + 150, 75 * y, -100, 100);
      }
    }
    context.fill();
    context.restore();
  }

  static clearCanvas(board: Board) {
    board.context.clearRect(0, 0, board.canvas.width, board.canvas.height);
  }

  /**
   * 
   * @param coord Coordinate of point to be checked
   * @param columnXBegin X-Coordinate of N-th column
   * @param radius Radius of a piece
   */
  static isCoordOnColumn(coord: { x: number, y: number }, columnXBegin: number, radius: number): boolean {
    return ((coord.x - columnXBegin) * (coord.x - columnXBegin) <= radius * radius);
  }

  static getColumnFromCoord(coord: { x: number, y: number }) {
    for (let i = 0; i < Board.column; i++) {
      if (Utils.isCoordOnColumn(coord, 75 * i + 100, 25)) {
        return i
      }
    }
    return -1
  }

  static getRandomColumnNumber(): number {
    return Math.floor(Math.random() * Board.column);
  }
  /**
   * @see https://esdiscuss.org/topic/promises-async-functions-and-requestanimationframe-together
   */
  static animationFrame() {
    let resolve = null
    const promise = new Promise(r => resolve = r)
    window.requestAnimationFrame(resolve)
    return promise
  }
}
