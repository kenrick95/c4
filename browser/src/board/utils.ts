import { Board } from './index'

type Callback = () => void

export function onresize(callback: Callback): () => void {
  let running: boolean = false
  let disposed: boolean = false
  let animationFrameId: number | undefined
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  // Fired on resize event.
  function resize() {
    if (!disposed && !running) {
      running = true

      if (window.requestAnimationFrame) {
        animationFrameId = window.requestAnimationFrame(runCallbacks)
      } else {
        timeoutId = setTimeout(runCallbacks, 66)
      }
    }
  }

  // Run the actual callbacks.
  function runCallbacks() {
    animationFrameId = undefined
    timeoutId = undefined
    if (!disposed) {
      callback()
    }
    running = false
  }

  window.addEventListener('resize', resize)
  return () => {
    if (disposed) {
      return
    }
    disposed = true
    window.removeEventListener('resize', resize)
    if (animationFrameId !== undefined) {
      window.cancelAnimationFrame(animationFrameId)
    }
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    running = false
  }
}

export function drawCircle(
  context: CanvasRenderingContext2D,
  { x = 0, y = 0, r = 0, fillStyle = '', strokeStyle = '' },
) {
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
 * @param context Canvas 2D Context
 * @param board   current board
 */
export function drawMask(board: Board) {
  const context = board.context
  context.save()
  context.fillStyle = Board.MASK_COLOR
  context.beginPath()
  const doubleRadius = 2 * Board.PIECE_RADIUS
  const tripleRadius = 3 * Board.PIECE_RADIUS
  for (let y = 0; y < Board.ROWS; y++) {
    for (let x = 0; x < Board.COLUMNS; x++) {
      context.arc(
        tripleRadius * x + Board.MASK_X_BEGIN + doubleRadius,
        tripleRadius * y + Board.MASK_Y_BEGIN + doubleRadius,
        Board.PIECE_RADIUS,
        0,
        2 * Math.PI,
      )
      context.rect(
        tripleRadius * x + Board.MASK_X_BEGIN + 2 * doubleRadius,
        tripleRadius * y + Board.MASK_Y_BEGIN,
        -2 * doubleRadius,
        2 * doubleRadius,
      )
    }
  }
  context.fill()
  context.restore()
}

export function clearCanvas(board: Board) {
  board.context.clearRect(0, 0, Board.CANVAS_WIDTH, Board.CANVAS_HEIGHT)
}
