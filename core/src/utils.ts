import { BoardPiece, BoardBase } from './board/base'

export const BIG_POSITIVE_NUMBER = 10 ** 9 + 7
export const BIG_NEGATIVE_NUMBER = -BIG_POSITIVE_NUMBER

export function showMessage(message = '') {
  const messageDOM = document.querySelector('.message')
  if (!messageDOM) {
    console.error('Message DOM is null!')
    return
  }
  messageDOM.classList.remove('hidden')

  const messageContentDOM = document.querySelector('.message-body-content')
  if (!messageContentDOM) {
    console.error('Message body content DOM is null!')
    return
  }
  messageContentDOM.innerHTML = message

  const messageDismissDOM = document.querySelector('.message-body-dismiss')
  if (!messageDismissDOM) {
    console.error('Message body dismiss DOM is null!')
    return
  }
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

/**
 *
 * @param coord Coordinate of point to be checked
 * @param columnXBegin X-Coordinate of N-th column
 * @param radius Radius of a piece
 */
export function isCoordOnColumn(
  coord: { x: number; y: number },
  columnXBegin: number,
  radius: number
): boolean {
  return (coord.x - columnXBegin) * (coord.x - columnXBegin) <= radius * radius
}

export function getColumnFromCoord(coord: { x: number; y: number }) {
  for (let i = 0; i < BoardBase.COLUMNS; i++) {
    if (
      isCoordOnColumn(
        coord,
        3 * BoardBase.PIECE_RADIUS * i +
          BoardBase.MASK_X_BEGIN +
          2 * BoardBase.PIECE_RADIUS,
        BoardBase.PIECE_RADIUS
      )
    ) {
      return i
    }
  }
  return -1
}

export function getRandomColumnNumber(): number {
  return Math.floor(Math.random() * BoardBase.COLUMNS)
}
export function choose(choice: Array<any>): any {
  return choice[Math.floor(Math.random() * choice.length)]
}

/**
 * @see https://esdiscuss.org/topic/promises-async-functions-and-requestanimationframe-together
 */
export function animationFrame() {
  let resolve = null
  const promise = new Promise((r) => (resolve = r))
  if (resolve) {
    window.requestAnimationFrame(resolve)
  }
  return promise
}

export function clone(array: Array<Array<any>>): Array<Array<any>> {
  let arr = []
  for (let i = 0; i < array.length; i++) {
    arr[i] = array[i].slice()
  }
  return arr
}

export function getMockPlayerAction(
  map: Array<Array<number>>,
  boardPiece: BoardPiece,
  column: number
): {
  success: boolean
  map: Array<Array<number>>
} {
  const clonedMap = clone(map)
  if (
    clonedMap[0][column] !== BoardPiece.EMPTY ||
    column < 0 ||
    column >= BoardBase.COLUMNS
  ) {
    return {
      success: false,
      map: clonedMap,
    }
  }

  let isColumnEverFilled = false
  let row = 0
  for (let i = 0; i < BoardBase.ROWS - 1; i++) {
    if (clonedMap[i + 1][column] !== BoardPiece.EMPTY) {
      isColumnEverFilled = true
      row = i
      break
    }
  }
  if (!isColumnEverFilled) {
    row = BoardBase.ROWS - 1
  }
  clonedMap[row][column] = boardPiece

  return {
    success: true,
    map: clonedMap,
  }
}

/**
 * From Mozilla Developer Network
 * https://developer.mozilla.org/en-US/docs/Web/Events/resize
 */
export function onresize() {
  var callbacks: Array<Function> = [],
    running = false

  // fired on resize event
  function resize() {
    if (!running) {
      running = true

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks)
      } else {
        setTimeout(runCallbacks, 66)
      }
    }
  }

  // run the actual callbacks
  function runCallbacks() {
    callbacks.forEach(function (callback) {
      callback()
    })
    running = false
  }

  // adds callback to loop
  function addCallback(callback: Function) {
    if (callback) {
      callbacks.push(callback)
    }
  }

  return {
    // public method to add additional callback
    add: function (callback: Function) {
      if (!callbacks.length) {
        window.addEventListener('resize', resize)
      }
      addCallback(callback)
    },
  }
}
