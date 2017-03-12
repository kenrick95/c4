import {Player} from './player';
import {Utils} from './utils';

export enum BoardPiece {
  EMPTY,
  PLAYER_1,
  PLAYER_2
}
export class Board {
  row: number = 6;
  column: number = 7;
  map: Array<Array<number>>;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.map = []
    for (let i = 0; i < this.row; i++) {
      this.map.push([])
      for (let j = 0; j < this.column; j++) {
        this.map[i].push(BoardPiece.EMPTY)
      }
    }

    this.canvas = canvas;
    this.context = canvas.getContext('2d');

  }

  /**
   * 
   * @returns is the action succesfully applied
   * @param player current player
   * @param column the colum in which the player want to drop a piece
   */
  applyPlayerAction(player: Player, column: number): boolean {
    if (this.map[0][column] !== BoardPiece.EMPTY || column < 0 || column >= this.column) {
      return false
    }

    let isColumnEverFilled = false;
    let row = 0;
    for (let i = 0; i < this.row; i++) {
      if (this.map[i + 1][column] !== BoardPiece.EMPTY) {
        isColumnEverFilled = true;
        row = i;
        break;
      }
    }
    if (!isColumnEverFilled) {
      row = this.row - 1;
    }

    this.map[row][column] = player.boardPiece;

    return true
  }

  private getPlayerColor(boardPiece: BoardPiece): string {
    switch (boardPiece) {
      case BoardPiece.PLAYER_1: return "#ff4136";
      case BoardPiece.PLAYER_2: return "#0074d9";
      default: return "transparent";
    }
  }


  render() {
    let x, y;
    for (y = 0; y < this.row; y++) {
      for (x = 0; x < this.column; x++) {
        Utils.drawCircle(this.context, {
          x: 75 * x + 100,
          y: 75 * y + 50,
          r: 25,
          fill: this.getPlayerColor(this.map[y][x]),
          stroke: "black"
        });
      }
    }
  }
}