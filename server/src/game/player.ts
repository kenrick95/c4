import { BoardPiece } from '@kenrick95/c4/src/board'
import { PlayerShadow } from '@kenrick95/c4/src/player'
import { PlayerId } from '../types'

export class ServerPlayer extends PlayerShadow {
  playerId: PlayerId
  constructor(boardPiece: BoardPiece, playerId: PlayerId) {
    super(boardPiece)
    this.playerId = playerId
  }
}
