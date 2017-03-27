import { Board, BoardPiece } from './board';

export class Utils {
  static readonly BIG_POSITIVE_NUMBER = 10 ** 9 + 7;
  static readonly BIG_NEGATIVE_NUMBER = -Utils.BIG_POSITIVE_NUMBER;

  static showMessage(message = '') {
    const messageDOM = document.querySelector('.message')
    messageDOM.classList.remove('hidden')

    const messageContentDOM = document.querySelector('.message-body-content')
    messageContentDOM.innerHTML = message

    const messageDismissDOM = document.querySelector('.message-body-dismiss')
    const dismissHandler = () => {
      messageDOM.classList.add('invisible')
      messageDOM.addEventListener('transitionend', () => {
        messageDOM.classList.add('hidden')
        messageDOM.classList.remove('invisible')
      })
      messageDismissDOM.removeEventListener('click', dismissHandler)
    }
    messageDismissDOM.addEventListener('click', dismissHandler)
  }

  static drawCircle(context: CanvasRenderingContext2D, { x = 0, y = 0, r = 0, fillStyle = '', strokeStyle = '' }) {
    context.save()
    context.fillStyle = fillStyle
    context.strokeStyle = strokeStyle
    context.beginPath()
    context.arc(x, y, r, 0, 2 * Math.PI, false)
    context.fill()
    context.restore()
  }
  /**
   * @see http://stackoverflow.com/a/11770000/917957
   * @static
   * @param context Canvas 2D Context
   * @param board   current board
   */
  static drawMask(board: Board) {
    const context = board.context
    context.save()
    context.fillStyle = Board.MASK_COLOR
    context.beginPath()
    const doubleRadius = 2 * Board.PIECE_RADIUS
    const tripleRadius = 3 * Board.PIECE_RADIUS
    for (let y = 0; y < Board.ROWS; y++) {
      for (let x = 0; x < Board.COLUMNS; x++) {
        context.arc(tripleRadius * x + Board.MASK_X_BEGIN + doubleRadius,
          tripleRadius * y + Board.MASK_Y_BEGIN + doubleRadius, Board.PIECE_RADIUS, 0, 2 * Math.PI)
        context.rect(tripleRadius * x + Board.MASK_X_BEGIN + 2 * doubleRadius,
          tripleRadius * y + Board.MASK_Y_BEGIN, -2 * doubleRadius, 2 * doubleRadius)
      }
    }
    context.fill()
    context.restore()
  }

  static clearCanvas(board: Board) {
    board.context.clearRect(0, 0, board.canvas.width, board.canvas.height)
  }

  /**
   * 
   * @param coord Coordinate of point to be checked
   * @param columnXBegin X-Coordinate of N-th column
   * @param radius Radius of a piece
   */
  static isCoordOnColumn(coord: { x: number, y: number }, columnXBegin: number, radius: number): boolean {
    return ((coord.x - columnXBegin) * (coord.x - columnXBegin) <= radius * radius)
  }

  static getColumnFromCoord(coord: { x: number, y: number }) {
    for (let i = 0; i < Board.COLUMNS; i++) {
      if (Utils.isCoordOnColumn(coord, 3 * Board.PIECE_RADIUS * i + Board.MASK_X_BEGIN + 2 * Board.PIECE_RADIUS, Board.PIECE_RADIUS)) {
        return i
      }
    }
    return -1
  }

  static getRandomColumnNumber(): number {
    return Math.floor(Math.random() * Board.COLUMNS)
  }
  static choose(choice: Array<any>): any {
    return choice[Math.floor(Math.random() * choice.length)]
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
    return arr
  }

  static getMockPlayerAction(map: Array<Array<number>>, boardPiece: BoardPiece, column: number): {
    success: boolean,
    map: Array<Array<number>>
  } {
    const clonedMap = Utils.clone(map)
    if (clonedMap[0][column] !== BoardPiece.EMPTY || column < 0 || column >= Board.COLUMNS) {
      return {
        success: false,
        map: clonedMap
      }
    }

    let isColumnEverFilled = false
    let row = 0
    for (let i = 0; i < Board.ROWS - 1; i++) {
      if (clonedMap[i + 1][column] !== BoardPiece.EMPTY) {
        isColumnEverFilled = true
        row = i
        break
      }
    }
    if (!isColumnEverFilled) {
      row = Board.ROWS - 1
    }
    clonedMap[row][column] = boardPiece

    return {
      success: true,
      map: clonedMap
    }
  }

  /**
   * From Mozilla Developer Network
   * https://developer.mozilla.org/en-US/docs/Web/Events/resize
   */
  static onresize() {
    var callbacks: Array<Function> = [],
      running = false;

    // fired on resize event
    function resize() {
      if (!running) {
        running = true;

        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(runCallbacks);
        } else {
          setTimeout(runCallbacks, 66);
        }
      }

    }

    // run the actual callbacks
    function runCallbacks() {
      callbacks.forEach(function (callback) {
        callback();
      });
      running = false;
    }

    // adds callback to loop
    function addCallback(callback: Function) {
      if (callback) {
        callbacks.push(callback);
      }

    }

    return {
      // public method to add additional callback
      add: function (callback: Function) {
        if (!callbacks.length) {
          window.addEventListener('resize', resize);
        }
        addCallback(callback);
      }
    }
  }
}
