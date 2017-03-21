import { Board, BoardPiece } from '../board';
import { GameBase } from './game-base';
import { Player, PlayerHuman, PlayerAi } from '../player';
import { Utils } from '../utils';

class GameLocalAi extends GameBase {
  constructor(players: Array<Player>, canvas: HTMLCanvasElement) {
    super(players, canvas)
  }
}
export function initGameLocalAi() {
  const canvas = document.querySelector('canvas')
  const game = new GameLocalAi([
    new PlayerHuman(BoardPiece.PLAYER_1, canvas),
    new PlayerAi(BoardPiece.PLAYER_2, canvas)
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
