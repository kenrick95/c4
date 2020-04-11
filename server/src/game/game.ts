import { ServerBoard } from './board'
import { GameBase } from '@kenrick95/c4-core/game'
import { ServerPlayer } from './player'

export class ServerGame extends GameBase<ServerPlayer> {
  constructor(players: Array<ServerPlayer>, board: ServerBoard) {
    super(players, board)
  }
  afterMove() {
    // no-op
  }
}
