import { Player } from './player'
import { Board, BoardPiece } from '../board'

export class PlayerShadow extends Player {
  actionPromiseResolver: null | ((column: number) => void)

  constructor(boardPiece: BoardPiece) {
    super(boardPiece)
    this.actionPromiseResolver = null
  }

  doAction(column: number) {
    if (this.actionPromiseResolver && 0 <= column && column < Board.COLUMNS) {
      this.actionPromiseResolver(column)
    }
  }

  async getAction(board: Board): Promise<number> {
    return new Promise<number>(r => (this.actionPromiseResolver = r))
  }
}
