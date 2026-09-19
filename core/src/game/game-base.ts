import { type BoardBase, BoardPiece } from '../board'
import type { Player } from '../player'

export abstract class GameBase<P extends Player = Player> {
  board: BoardBase
  players: Array<P>
  currentPlayerId: number
  isMoveAllowed: boolean = false
  isGameWon: boolean = false
  isGameEnded: boolean = false
  private sessionId: number = 0

  constructor(players: Array<P>, board: BoardBase) {
    this.board = board
    this.players = players
    this.currentPlayerId = 0
    this.reset()
  }
  reset() {
    this.sessionId++
    this.isMoveAllowed = false
    this.isGameWon = false
    this.isGameEnded = false
    this.cancelPendingActions()
    this.board.reset()
    // this.board.debug()
  }
  end() {
    this.stopCurrentSession()
    this.isGameEnded = true
    this.board.reset()
  }

  async start() {
    if (this.isGameEnded) {
      return
    }
    const sessionId = ++this.sessionId
    this.isMoveAllowed = true
    while (!this.isGameWon && this.isCurrentSession(sessionId)) {
      if (this.isGameEnded) {
        return
      }
      await this.move(sessionId)
      if (!this.isCurrentSession(sessionId)) {
        return
      }
      const winner = this.board.getWinner()
      if (winner !== BoardPiece.EMPTY) {
        console.log('[GameBase] Game over: winner is player ', winner)
        this.isGameWon = true
        this.isMoveAllowed = false
        this.announceWinner(winner)
        break
      }
    }
  }
  async move(sessionId: number = this.sessionId) {
    if (!this.isCurrentSession(sessionId) || this.isGameEnded) {
      return
    }
    if (!this.isMoveAllowed) {
      return
    }
    const currentPlayer = this.players[this.currentPlayerId]
    let actionSuccesful = false
    while (!actionSuccesful && this.isCurrentSession(sessionId)) {
      if (this.isGameEnded) {
        return
      }
      this.waitingForMove()
      const action = await currentPlayer.getAction(this.board)
      if (!this.isCurrentSession(sessionId)) {
        return
      }
      this.isMoveAllowed = false
      this.beforeMoveApplied(action)
      actionSuccesful = await this.board.applyPlayerAction(
        currentPlayer,
        action,
      )
      if (!this.isCurrentSession(sessionId)) {
        return
      }
      this.isMoveAllowed = true
      if (!actionSuccesful) {
        console.log('Move not allowed! Try again.')
      } else {
        this.afterMove(action)
      }
    }
    this.currentPlayerId = this.getNextPlayer()
  }
  abstract waitingForMove(): void
  abstract beforeMoveApplied(action: number): void
  abstract afterMove(action: number): void

  announceWinner(winnerPiece: BoardPiece) {
    const winner = {
      [BoardPiece.DRAW]: 'draw',
      [BoardPiece.PLAYER_1]: 'Player 1',
      [BoardPiece.PLAYER_2]: 'Player 2',
      [BoardPiece.EMPTY]: 'none',
    }[winnerPiece]
    console.log('[GameBase] Game over: winner is ', winner, winnerPiece)
  }

  protected stopCurrentSession(): void {
    this.sessionId++
    this.isMoveAllowed = false
    this.cancelPendingActions()
  }

  private getNextPlayer() {
    return this.currentPlayerId === 0 ? 1 : 0
  }

  private isCurrentSession(sessionId: number): boolean {
    return sessionId === this.sessionId
  }

  private cancelPendingActions(): void {
    for (const player of this.players) {
      player.cancelPendingAction()
    }
  }
}
