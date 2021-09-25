import { BoardPiece, BoardBase } from './board/base'

export const BIG_POSITIVE_NUMBER: number = 10 ** 9 + 7
export const BIG_NEGATIVE_NUMBER: number = -BIG_POSITIVE_NUMBER

export function showMessage(message: string = ''): void {
  const messageDOM: Element | null = document.querySelector('.message')

  if (!messageDOM) return console.error('Message DOM is null!')

  messageDOM.classList.remove('hidden')

  const messageContentDOM: Element | null = document.querySelector(
    '.message-body-content'
  )

  if (!messageContentDOM)
    return console.error('Message body content DOM is null!')

  messageContentDOM.innerHTML = message

  const messageDismissDOM: Element | null = document.querySelector(
    '.message-body-dismiss'
  )

  if (!messageDismissDOM)
    return console.error('Message body dismiss DOM is null!')

  const dismissHandler = (): void => {
    messageDOM.classList.add('invisible')
    messageDOM.addEventListener('transitionend', (): void => {
      messageDOM.classList.add('hidden')
      messageDOM.classList.remove('invisible')
    })

    messageDismissDOM.removeEventListener('click', dismissHandler)
  }

  messageDismissDOM.addEventListener('click', dismissHandler)
}

/**
 *
 * @param {{ x: number; y: number }} coord The Coordinates of the point to be checked.
 * @param {number} columnXBegin The X-Coordinate of N-th column.
 * @param {number} radius The radius of a piece.
 */
export function isCoordOnColumn(
  coord: { x: number; y: number },
  columnXBegin: number,
  radius: number
): boolean {
  return (coord.x - columnXBegin) * (coord.x - columnXBegin) <= radius * radius
}

export function getColumnFromCoord(coord: { x: number; y: number }): number {
  for (let i: number = 0; i < BoardBase.COLUMNS; i++)
    if (
      isCoordOnColumn(
        coord,
        3 * BoardBase.PIECE_RADIUS * i +
          BoardBase.MASK_X_BEGIN +
          2 * BoardBase.PIECE_RADIUS,
        BoardBase.PIECE_RADIUS
      )
    )
      return i

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
export function animationFrame(): Promise<Function> {
  let resolve: Function | null = null
  const promise: Promise<Function> = new Promise(
    (r: Function): Function => (resolve = r)
  )

  if (resolve) window.requestAnimationFrame(resolve)

  return promise
}

export function clone(array: Array<Array<any>>): Array<Array<any>> {
  const arr: Array<Array<any>> = []

  for (let i: number = 0; i < array.length; i++) arr[i] = array[i].slice()

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
  const clonedMap: Array<Array<any>> = clone(map)

  if (
    clonedMap[0][column] !== BoardPiece.EMPTY ||
    column < 0 ||
    column >= BoardBase.COLUMNS
  )
    return {
      success: false,
      map: clonedMap,
    }

  let isColumnEverFilled: boolean = false
  let row: number = 0
  for (let i: number = 0; i < BoardBase.ROWS - 1; i++)
    if (clonedMap[i + 1][column] !== BoardPiece.EMPTY) {
      isColumnEverFilled = true
      row = i

      break
    }

  if (!isColumnEverFilled) row = BoardBase.ROWS - 1

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
export function onresize(): { add: Function } {
  const callbacks: Array<Function> = []
  let running: boolean = false

  // Fired on resize event.
  function resize() {
    if (!running) {
      running = true

      if (window.requestAnimationFrame)
        window.requestAnimationFrame(runCallbacks)
      else setTimeout(runCallbacks, 66)
    }
  }

  // Run the actual callbacks.
  function runCallbacks() {
    callbacks.forEach((callback: Function): void => {
      callback()
    })

    running = false
  }

  // Adds callback to loop.
  function addCallback(callback: Function): void {
    if (callback) callbacks.push(callback)
  }

  return {
    // Public method to add additional callback.
    add: (callback: Function) => {
      if (!callbacks.length) window.addEventListener('resize', resize)

      addCallback(callback)
    },
  }
}
