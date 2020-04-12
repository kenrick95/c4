import { BoardPiece } from '@kenrick95/c4/src/board'
import { PlayerAi } from '@kenrick95/c4/src/player'
import { GameLocal, initGameLocal } from './game-local'

class GameLocalAi extends GameLocal {}
export function initGameLocalAi() {
  initGameLocal(GameLocalAi, new PlayerAi(BoardPiece.PLAYER_2))
}
