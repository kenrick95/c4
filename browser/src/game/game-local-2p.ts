import { BoardPiece } from '@kenrick95/c4'
import { PlayerHuman } from '@kenrick95/c4'
import { GameLocal, initGameLocal } from './game-local'

class GameLocal2p extends GameLocal {}
export function initGameLocal2p(
  firstPlayerName: string,
  secondPlayerName: string,
) {
  const firstPlayer = new PlayerHuman(BoardPiece.PLAYER_1, firstPlayerName)
  const secondPlayer = new PlayerHuman(BoardPiece.PLAYER_2, secondPlayerName)
  return initGameLocal(GameLocal2p, firstPlayer, secondPlayer)
}
