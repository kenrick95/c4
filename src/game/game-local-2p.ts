import { Board, BoardPiece } from '../board';
import { GameBase } from './game-base';
import { Player, PlayerHuman } from '../player';
import { Utils } from '../utils';

class GameLocal2p extends GameBase {
  constructor(players: Array<Player>, canvas: HTMLCanvasElement) {
    super(players, canvas)
  }
}
export function initGameLocal2p() {
  const canvas = document.querySelector('canvas')
  const game = new GameLocal2p([
    new PlayerHuman(BoardPiece.PLAYER_1, canvas),
    new PlayerHuman(BoardPiece.PLAYER_2, canvas)
  ], canvas)
  game.start()
  canvas.addEventListener('click', async () => {
    if (game.isGameWon) {
      game.reset()
      await Utils.animationFrame()
      game.start()
    }
  })
}
