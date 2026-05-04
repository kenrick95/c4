import { BoardBase, type BoardPiece } from '../board'
import { Player } from './player'

export class PlayerHuman extends Player {
  clickPromiseResolver: null | ((column: number) => void)

  constructor(boardPiece: BoardPiece, label: string) {
    super(boardPiece, label)
    this.clickPromiseResolver = null
  }

  doAction(column: number) {
    if (
      this.clickPromiseResolver &&
      0 <= column &&
      column < BoardBase.COLUMNS
    ) {
      this.clickPromiseResolver(column)
    }
  }

  getAction(_board: BoardBase): Promise<number> {
    return new Promise<number>((r) => (this.clickPromiseResolver = r))
  }
}
