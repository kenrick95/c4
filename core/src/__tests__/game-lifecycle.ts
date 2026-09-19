import { describe, expect, test } from 'vitest'
import { BoardBase, BoardPiece } from '../board'
import { GameBase } from '../game'
import { PlayerHuman } from '../player'

class LifecycleGame extends GameBase {
  movesApplied: number = 0

  waitingForMove() {
    // no-op
  }
  beforeMoveApplied() {
    // no-op
  }
  afterMove() {
    this.movesApplied++
  }
}

class DelayedBoard extends BoardBase {
  private resolveApply: (() => void) | undefined

  async applyPlayerAction() {
    await new Promise<void>((resolve) => {
      this.resolveApply = resolve
    })
    return true
  }

  finishApplyingMove() {
    this.resolveApply?.()
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

  test('ending a game prevents a pending board update from changing game state', async () => {
    const firstPlayer = new PlayerHuman(BoardPiece.PLAYER_1, 'Player 1')
    const secondPlayer = new PlayerHuman(BoardPiece.PLAYER_2, 'Player 2')
    const board = new DelayedBoard()
    const game = new LifecycleGame([firstPlayer, secondPlayer], board)

    const gameStart = game.start()
    await Promise.resolve()
    firstPlayer.doAction(0)
    await Promise.resolve()
    game.end()
    board.finishApplyingMove()
    await gameStart

    expect(game.isGameEnded).toBe(true)
    expect(game.isMoveAllowed).toBe(false)
    expect(game.movesApplied).toBe(0)
  })

  test('a reset game ignores a stale board update from its previous run', async () => {
    const firstPlayer = new PlayerHuman(BoardPiece.PLAYER_1, 'Player 1')
    const secondPlayer = new PlayerHuman(BoardPiece.PLAYER_2, 'Player 2')
    const board = new DelayedBoard()
    const game = new LifecycleGame([firstPlayer, secondPlayer], board)

    const firstRun = game.start()
    await Promise.resolve()
    firstPlayer.doAction(0)
    await Promise.resolve()

    game.reset()
    const secondRun = game.start()
    await Promise.resolve()
    board.finishApplyingMove()
    await firstRun

    expect(game.currentPlayerId).toBe(0)
    expect(game.isMoveAllowed).toBe(true)
    expect(game.movesApplied).toBe(0)

    game.end()
    await secondRun
  })
})
