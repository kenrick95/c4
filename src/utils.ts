import { Board, BoardPiece } from './board';

export class Utils {
  static BIG_POSITIVE_NUMBER = 10 ** 9 + 7;
  static BIG_NEGATIVE_NUMBER = -Utils.BIG_POSITIVE_NUMBER;

  static drawText(context: CanvasRenderingContext2D, { message = '', x = 0, y = 0, fillStyle = '#111', font = '12pt sans-serif', maxWidth = Utils.BIG_POSITIVE_NUMBER } ) {
    context.save()
    context.font = font
    context.fillStyle = fillStyle
    context.fillText(message, x, y, maxWidth)
    context.restore()
  }

  static drawCircle(context: CanvasRenderingContext2D, { x = 0, y = 0, r = 0, fillStyle = '', strokeStyle = '' }) {
    context.save();
    context.fillStyle = fillStyle;
    context.strokeStyle = strokeStyle;
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
  static choose(choice: Array<any>): any {
    return choice[Math.floor(Math.random() * choice.length)];
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

  static clone(array: Array<Array<any>>): Array<Array<any>> {
    let arr = []
    for (let i = 0; i < array.length; i++) {
      arr[i] = array[i].slice()
    }
    return arr;
  }

  static getMockPlayerAction(map: Array<Array<number>>, boardPiece: BoardPiece, column: number): {
    success: boolean,
    map: Array<Array<number>>
  } {
    const clonedMap = Utils.clone(map)
    if (clonedMap[0][column] !== BoardPiece.EMPTY || column < 0 || column >= Board.column) {
      return {
        success: false,
        map: clonedMap
      }
    }

    let isColumnEverFilled = false;
    let row = 0;
    for (let i = 0; i < Board.row - 1; i++) {
      if (clonedMap[i + 1][column] !== BoardPiece.EMPTY) {
        isColumnEverFilled = true;
        row = i;
        break;
      }
    }
    if (!isColumnEverFilled) {
      row = Board.row - 1;
    }
    clonedMap[row][column] = boardPiece;

    return {
      success: true,
      map: clonedMap
    }
  }
}
