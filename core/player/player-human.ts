import { Player } from './player'
import { Board, BoardPiece } from '../board'

export class PlayerHuman extends Player {
  clickPromiseResolver: null | ((column: number) => void)

  constructor(boardPiece: BoardPiece) {
    super(boardPiece)
    this.clickPromiseResolver = null
  }

  doAction(column: number) {
    if (this.clickPromiseResolver && 0 <= column && column < Board.COLUMNS) {
      this.clickPromiseResolver(column)
    }
  }

  async getAction(board: Board): Promise<number> {
    return new Promise<number>(r => (this.clickPromiseResolver = r))
  }
}
