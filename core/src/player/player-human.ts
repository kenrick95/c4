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
      this.resolveAction(column)
    }
  }

  getAction(_board: BoardBase): Promise<number> {
    this.cancelPendingAction()
    return new Promise<number>((resolve) => {
      this.clickPromiseResolver = resolve
    })
  }

  cancelPendingAction(): void {
    this.resolveAction(-1)
  }

  private resolveAction(column: number): void {
    const resolve = this.clickPromiseResolver
    this.clickPromiseResolver = null
    resolve?.(column)
  }
}
