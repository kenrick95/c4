import { type BoardPiece, GameBase } from '@kenrick95/c4'
import { store } from '..'
import { gameEnded } from '../actions'
import type { MatchId } from '../types'
import type { ServerBoard } from './board'
import type { ServerPlayer } from './player'

export class ServerGame extends GameBase<ServerPlayer> {
  matchId: MatchId
  constructor(
    players: Array<ServerPlayer>,
    board: ServerBoard,
    matchId: MatchId,
  ) {
    super(players, board)
    this.matchId = matchId
  }
  waitingForMove() {
    // no-op
  }
  beforeMoveApplied() {
    // no-op
  }
  afterMove() {
    // no-op
  }
  announceWinner(winnerBoardPiece: BoardPiece) {
    super.announceWinner(winnerBoardPiece)
    store.dispatch(gameEnded(this.matchId, winnerBoardPiece))
  }
}
