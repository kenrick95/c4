import { BoardBase } from '@kenrick95/c4-core/board'
import { GameBase } from '@kenrick95/c4-core/game'
import { Player } from '@kenrick95/c4-core/player'

// TODO: Implement "game state" in server
export class ServerGame extends GameBase {
  constructor(players: Array<Player>, board: BoardBase) {
    super(players, board)
  }
  afterMove() {
    // no-op
  }
}
