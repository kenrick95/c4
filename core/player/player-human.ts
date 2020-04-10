import { Player } from './player'
import { Board, BoardPiece } from '../board'
import { Utils } from '../utils'

export class PlayerHuman extends Player {
  clickPromiseResolver: any

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
