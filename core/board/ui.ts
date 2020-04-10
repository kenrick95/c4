import { BoardBase, BoardPiece } from './base'
import { Player } from '../player'
import { Utils } from '../utils'

export class Board extends BoardBase {
  canvas: HTMLCanvasElement
  constructor(canvas: HTMLCanvasElement) {
    super(<CanvasRenderingContext2D>canvas.getContext('2d'))
    this.canvas = canvas
    this.getBoardScale()
    this.initConstants()
    this.reset()
    this.onresize()
  }

  onresize() {
    let prevBoardScale = BoardBase.SCALE
    Utils.onresize().add(() => {
      this.getBoardScale()
      if (prevBoardScale !== BoardBase.SCALE) {
        prevBoardScale = BoardBase.SCALE
        this.initConstants()
        Utils.clearCanvas(this)
        this.render()
      }
    })
  }

  reset() {
    super.reset()
    if (this.canvas) {
      Utils.clearCanvas(this)
      this.render()
    }
  }

  initConstants() {
    super.initConstants()
    if (this.canvas) {
      /**
       * Scale the canvas to make it look sharper on hi-dpi devices
       * https://www.html5rocks.com/en/tutorials/canvas/hidpi/
       */
      const dpr = self.devicePixelRatio || 1
      this.canvas.width = Board.CANVAS_WIDTH * dpr
      this.canvas.height = Board.CANVAS_HEIGHT * dpr
      this.context.scale(dpr, dpr)
      this.canvas.style.width = Board.CANVAS_WIDTH + 'px'
      this.canvas.style.height = Board.CANVAS_HEIGHT + 'px'
    }
  }

  private async animateAction(
    newRow: number,
    column: number,
    boardPiece: BoardPiece
  ): Promise<void> {
    const fillStyle = this.getPlayerColor(boardPiece)
    let currentY = 0
    const doAnimation = async () => {
      Utils.clearCanvas(this)
      Utils.drawCircle(this.context, {
        x:
          3 * BoardBase.PIECE_RADIUS * column +
          BoardBase.MASK_X_BEGIN +
          2 * BoardBase.PIECE_RADIUS,
        y: currentY + BoardBase.MASK_Y_BEGIN + 2 * BoardBase.PIECE_RADIUS,
        r: BoardBase.PIECE_RADIUS,
        fillStyle: fillStyle,
        strokeStyle: BoardBase.PIECE_STROKE_STYLE
      })
      this.render()
      currentY += BoardBase.PIECE_RADIUS
    }
    while (newRow * 3 * BoardBase.PIECE_RADIUS >= currentY) {
      await Utils.animationFrame()
      doAnimation()
    }
  }

  render() {
    Utils.drawMask(this)
    for (let y = 0; y < BoardBase.ROWS; y++) {
      for (let x = 0; x < BoardBase.COLUMNS; x++) {
        Utils.drawCircle(this.context, {
          x:
            3 * BoardBase.PIECE_RADIUS * x +
            BoardBase.MASK_X_BEGIN +
            2 * BoardBase.PIECE_RADIUS,
          y:
            3 * BoardBase.PIECE_RADIUS * y +
            BoardBase.MASK_Y_BEGIN +
            2 * BoardBase.PIECE_RADIUS,
          r: BoardBase.PIECE_RADIUS,
          fillStyle: this.getPlayerColor(this.map[y][x]),
          strokeStyle: BoardBase.PIECE_STROKE_STYLE
        })
      }
    }
  }

  async applyPlayerAction(player: Player, column: number): Promise<boolean> {
    if (
      this.map[0][column] !== BoardPiece.EMPTY ||
      column < 0 ||
      column >= BoardBase.COLUMNS
    ) {
      return false
    }

    let isColumnEverFilled = false
    let row = 0
    for (let i = 0; i < BoardBase.ROWS - 1; i++) {
      if (this.map[i + 1][column] !== BoardPiece.EMPTY) {
        isColumnEverFilled = true
        row = i
        break
      }
    }
    if (!isColumnEverFilled) {
      row = BoardBase.ROWS - 1
    }

    await this.animateAction(row, column, player.boardPiece)

    // reflect player's action to the map
    this.map[row][column] = player.boardPiece
    this.debug()

    await Utils.animationFrame()
    this.render()
    return true
  }
}
