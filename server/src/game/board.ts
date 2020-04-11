import { BoardBase } from '@kenrick95/c4-core'
import { store } from '..'
import { gameEnded } from '../actions'
import { MatchId } from '../types'

export class ServerBoard extends BoardBase {
  matchId: MatchId 
  constructor(matchId: MatchId) {
    super()
    this.matchId = matchId
  }
  announceWinner() {
    super.announceWinner()
    store.dispatch(gameEnded(this.matchId, this.winnerBoardPiece))
  }
}
