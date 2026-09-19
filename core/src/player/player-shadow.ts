import { BoardBase, type BoardPiece } from '../board'
import { Player } from './player'

export class PlayerShadow extends Player {
  actionPromiseResolver: null | ((column: number) => void)

  constructor(boardPiece: BoardPiece, label: string) {
    super(boardPiece, label)
    this.actionPromiseResolver = null
  }

  doAction(column: number) {
    if (
      this.actionPromiseResolver &&
      0 <= column &&
      column < BoardBase.COLUMNS
    ) {
      this.resolveAction(column)
    }
  }

  getAction(_board: BoardBase): Promise<number> {
    this.cancelPendingAction()
    return new Promise<number>((resolve) => {
      this.actionPromiseResolver = resolve
    })
  }

  cancelPendingAction(): void {
    this.resolveAction(-1)
  }

  private resolveAction(column: number): void {
    const resolve = this.actionPromiseResolver
    this.actionPromiseResolver = null
    resolve?.(column)
  }
}
