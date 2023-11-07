import { BoardPiece, PlayerHuman, PlayerAi } from '@kenrick95/c4'
import { GameLocal, initGameLocal } from './game-local'

class GameLocalAi extends GameLocal {}
export function initGameLocalAi(playerName: string) {
  const firstPlayer = new PlayerHuman(BoardPiece.PLAYER_1, playerName)
  const aiPlayer = new PlayerAi(BoardPiece.PLAYER_2, `AI Player`)
  return initGameLocal(GameLocalAi, firstPlayer, aiPlayer)
}
