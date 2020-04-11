import { PlayerShadow, BoardPiece } from '@kenrick95/c4-core'
import { PlayerId } from '../types'

export class ServerPlayer extends PlayerShadow {
  playerId: PlayerId
  constructor(boardPiece: BoardPiece, playerId: PlayerId) {
    super(boardPiece)
    this.playerId = playerId
  }
}
