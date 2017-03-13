import { Player } from './player';
import { Utils } from './utils';

export enum BoardPiece {
  EMPTY,
  PLAYER_1,
  PLAYER_2,
  DRAW
}
export class Board {
  static row: number = 6;
  static column: number = 7;
  map: Array<Array<number>>;
  private winnerBoardPiece: BoardPiece;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.reset()
  }

  reset() {
    this.map = []
    for (let i = 0; i < Board.row; i++) {
      this.map.push([])
      for (let j = 0; j < Board.column; j++) {
        this.map[i].push(BoardPiece.EMPTY)
      }
    }
    this.winnerBoardPiece = BoardPiece.EMPTY;
    Utils.clearCanvas(this)
  }

  /**
   * 
   * @returns is the action succesfully applied
   * @param player current player
   * @param column the colum in which the player want to drop a piece
   */
  async applyPlayerAction(player: Player, column: number): Promise<boolean> {
    if (this.map[0][column] !== BoardPiece.EMPTY || column < 0 || column >= Board.column) {
      return false
    }

    let isColumnEverFilled = false;
    let row = 0;
    for (let i = 0; i < Board.row - 1; i++) {
      if (this.map[i + 1][column] !== BoardPiece.EMPTY) {
        isColumnEverFilled = true;
        row = i;
        break;
      }
    }
    if (!isColumnEverFilled) {
      row = Board.row - 1;
    }

    await this.animateAction(row, column, player.boardPiece)

    // reflect player's action to the map
    this.map[row][column] = player.boardPiece;
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
      if (i < 0 || j < 0 || i >= Board.row || j >= Board.column || this.map[i][j] !== playerPiece) {
        return false
      }
      return isWinningSequence(i + dir[0], j + dir[1], playerPiece, dir, count + 1);
    }
    let countEmpty = 0
    for (let i = 0; i < Board.row; i++) {
      for (let j = 0; j < Board.column; j++) {
        const playerPiece = this.map[i][j];
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
    message += " - Click to reset";
    Utils.drawText(this.context, {
      message,
      x: 150,
      y: 20,
      maxWidth: 400
    })
  }

  private getPlayerColor(boardPiece: BoardPiece): string {
    switch (boardPiece) {
      case BoardPiece.PLAYER_1: return '#ff4136';
      case BoardPiece.PLAYER_2: return '#0074d9';
      default: return 'transparent';
    }
  }
  private async animateAction(newRow: number, column: number, boardPiece: BoardPiece): Promise<void> {
    const fillStyle = this.getPlayerColor(boardPiece)
    let currentY = 0
    const doAnimation = async () => {
      Utils.clearCanvas(this)
      Utils.drawCircle(this.context, {
        x: 75 * column + 100,
        y: currentY + 50,
        r: 25,
        fillStyle: fillStyle,
        strokeStyle: 'black'
      })
      this.render()
      currentY += 25
    }
    while (newRow * 75 >= currentY) {
      await Utils.animationFrame()
      doAnimation()
    }
  };

  render() {
    Utils.drawMask(this)
    let x, y;
    for (y = 0; y < Board.row; y++) {
      for (x = 0; x < Board.column; x++) {
        Utils.drawCircle(this.context, {
          x: 75 * x + 100,
          y: 75 * y + 50,
          r: 25,
          fillStyle: this.getPlayerColor(this.map[y][x]),
          strokeStyle: 'black'
        });
      }
    }
  }
}
