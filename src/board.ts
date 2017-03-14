import { Player } from './player';
import { Utils } from './utils';

export enum BoardPiece {
  EMPTY,
  PLAYER_1,
  PLAYER_2,
  DRAW
}
export class Board {
  static readonly ROWS: number = 6;
  static readonly COLUMNS: number = 7;
  static readonly CANVAS_HEIGHT: number = 480;
  static readonly CANVAS_WIDTH: number = 640;
  static readonly PLAYER_1_COLOR: string = '#ff4136';
  static readonly PLAYER_2_COLOR: string = '#0074d9';
  static readonly PIECE_RADIUS: number = 25;
  static readonly MASK_COLOR: string = '#dddddd';
  static readonly MASK_X_BEGIN: number = Math.max(0, Board.CANVAS_WIDTH - (3 * Board.COLUMNS + 1) * Board.PIECE_RADIUS) / 2;
  static readonly MASK_Y_BEGIN: number = Math.max(0, Board.CANVAS_HEIGHT - (3 * Board.ROWS + 1) * Board.PIECE_RADIUS) / 2;
  static readonly MESSAGE_WIDTH: number = 400;
  static readonly MESSAGE_X_BEGIN: number = (Board.CANVAS_WIDTH - Board.MESSAGE_WIDTH) / 2;
  static readonly MESSAGE_Y_BEGIN: number = 20;

  map: Array<Array<number>>;
  private winnerBoardPiece: BoardPiece;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.canvas.width = Board.CANVAS_WIDTH
    this.canvas.height = Board.CANVAS_HEIGHT
    this.context = canvas.getContext('2d')
    this.reset()
  }

  reset() {
    this.map = []
    for (let i = 0; i < Board.ROWS; i++) {
      this.map.push([])
      for (let j = 0; j < Board.COLUMNS; j++) {
        this.map[i].push(BoardPiece.EMPTY)
      }
    }
    this.winnerBoardPiece = BoardPiece.EMPTY
    Utils.clearCanvas(this)
  }

  /**
   * TODO: this seems particularly similar with Utils.getMockPlayerAction yet different in some places, probably could refactor
   * @returns is the action succesfully applied
   * @param player current player
   * @param column the colum in which the player want to drop a piece
   */
  async applyPlayerAction(player: Player, column: number): Promise<boolean> {
    if (this.map[0][column] !== BoardPiece.EMPTY || column < 0 || column >= Board.COLUMNS) {
      return false
    }

    let isColumnEverFilled = false
    let row = 0
    for (let i = 0; i < Board.ROWS - 1; i++) {
      if (this.map[i + 1][column] !== BoardPiece.EMPTY) {
        isColumnEverFilled = true
        row = i
        break
      }
    }
    if (!isColumnEverFilled) {
      row = Board.ROWS - 1
    }

    await this.animateAction(row, column, player.boardPiece)

    // reflect player's action to the map
    this.map[row][column] = player.boardPiece
    this.debug()

    await Utils.animationFrame()
    this.render()
    return true
  }

  debug() {
    console.log(this.map.map(row => row.join(' ')).join('\n'))
  }

  getWinner(): BoardPiece {
    if (this.winnerBoardPiece !== BoardPiece.EMPTY) {
      return this.winnerBoardPiece
    }
    const direction = [
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [1, -1],
      [1, 0],
      [1, 1]
    ]
    const isWinningSequence = (i: number, j: number, playerPiece: BoardPiece, dir: Array<number>, count: number): boolean => {
      if (count >= 4) {
        return true
      }
      if (i < 0 || j < 0 || i >= Board.ROWS || j >= Board.COLUMNS || this.map[i][j] !== playerPiece) {
        return false
      }
      return isWinningSequence(i + dir[0], j + dir[1], playerPiece, dir, count + 1)
    }
    let countEmpty = 0
    for (let i = 0; i < Board.ROWS; i++) {
      for (let j = 0; j < Board.COLUMNS; j++) {
        const playerPiece = this.map[i][j]
        if (playerPiece !== BoardPiece.EMPTY) {
          for (let k = 0; k < direction.length; k++) {
            const isWon = isWinningSequence(i + direction[k][0], j + direction[k][1], playerPiece, direction[k], 1)
            if (isWon) {
              return this.winnerBoardPiece = playerPiece
            }
          }

        } else {
          countEmpty++
        }
      }
    }
    if (countEmpty === 0) {
      return this.winnerBoardPiece = BoardPiece.DRAW
    }

    return BoardPiece.EMPTY
  }

  announceWinner() {
    if (this.winnerBoardPiece === BoardPiece.EMPTY) {
      return
    }
    let message = 'Thank you for playing - '
    if (this.winnerBoardPiece === BoardPiece.DRAW) {
      message += `It's a draw`
    } else {
      message += `Player ${this.winnerBoardPiece} wins`
    }
    message += ' - Click to reset';
    Utils.drawText(this.context, {
      message,
      x: Board.MESSAGE_X_BEGIN,
      y: Board.MESSAGE_Y_BEGIN,
      maxWidth: Board.MESSAGE_WIDTH
    })
  }

  private getPlayerColor(boardPiece: BoardPiece): string {
    switch (boardPiece) {
      case BoardPiece.PLAYER_1: return Board.PLAYER_1_COLOR
      case BoardPiece.PLAYER_2: return Board.PLAYER_2_COLOR
      default: return 'transparent'
    }
  }
  private async animateAction(newRow: number, column: number, boardPiece: BoardPiece): Promise<void> {
    const fillStyle = this.getPlayerColor(boardPiece)
    let currentY = 0
    const doAnimation = async () => {
      Utils.clearCanvas(this)
      Utils.drawCircle(this.context, {
        x: 3 * Board.PIECE_RADIUS * column + Board.MASK_X_BEGIN + 2 * Board.PIECE_RADIUS,
        y: currentY + Board.MASK_Y_BEGIN + 2 * Board.PIECE_RADIUS,
        r: Board.PIECE_RADIUS,
        fillStyle: fillStyle,
        strokeStyle: 'black'
      })
      this.render()
      currentY += Board.PIECE_RADIUS
    }
    while (newRow * 3 * Board.PIECE_RADIUS >= currentY) {
      await Utils.animationFrame()
      doAnimation()
    }
  };

  render() {
    Utils.drawMask(this)
    for (let y = 0; y < Board.ROWS; y++) {
      for (let x = 0; x < Board.COLUMNS; x++) {
        Utils.drawCircle(this.context, {
          x: 3 * Board.PIECE_RADIUS * x + Board.MASK_X_BEGIN + 2 * Board.PIECE_RADIUS,
          y: 3 * Board.PIECE_RADIUS * y + Board.MASK_Y_BEGIN + 2 * Board.PIECE_RADIUS,
          r: Board.PIECE_RADIUS,
          fillStyle: this.getPlayerColor(this.map[y][x]),
          strokeStyle: 'black'
        })
      }
    }
  }
}
