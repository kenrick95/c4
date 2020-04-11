import { BoardBase } from '@kenrick95/c4-core'

export class ServerBoard extends BoardBase {
  announceWinner() {
    // TODO: Dispatch GAME_ENDED action
    super.announceWinner()
    this.winnerBoardPiece
  }
}
