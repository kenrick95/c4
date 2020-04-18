import { GameBase } from '../game'
import { BoardBase } from '../board'
import { Player } from '../player'

export class TestGame extends GameBase {
  afterMoveResolve: null | (() => void) = null
  afterMovePromise: null | Promise<void> = null

  constructor(players: Array<Player>, board: BoardBase) {
    super(players, board)
    this.renewAfterMovePromise()
  }

  waitingForMove() {
    // no-op
  }
  beforeMoveApplied() {
    // no-op
  }
  afterMove() {
    if (this.afterMoveResolve) {
      this.afterMoveResolve()
    }
    this.renewAfterMovePromise()
  }

  renewAfterMovePromise() {
    this.afterMovePromise = new Promise(
      (resolve) => (this.afterMoveResolve = resolve)
    )
  }
}
