import { describe, expect, test } from 'vitest'
import { BoardBase, BoardPiece } from '../board'
import { GameBase } from '../game'
import { PlayerHuman } from '../player'

class LifecycleGame extends GameBase {
  waitingForMove() {
    // no-op
  }
  beforeMoveApplied() {
    // no-op
  }
  afterMove() {
    // no-op
  }
}

describe('GameBase lifecycle', () => {
  test('ending a game cancels a pending player action', async () => {
    const firstPlayer = new PlayerHuman(BoardPiece.PLAYER_1, 'Player 1')
    const secondPlayer = new PlayerHuman(BoardPiece.PLAYER_2, 'Player 2')
    const board = new BoardBase()
    const game = new LifecycleGame([firstPlayer, secondPlayer], board)

    const gameStart = game.start()
    await Promise.resolve()
    game.end()
    await gameStart
    firstPlayer.doAction(0)

    expect(game.isGameEnded).toBe(true)
    expect(game.isMoveAllowed).toBe(false)
    expect(board.map[BoardBase.ROWS - 1][0]).toBe(BoardPiece.EMPTY)
  })
})
