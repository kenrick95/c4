import { BoardPiece } from './board';
import { Player } from './player';
import { PlayerHumanFlywebClient } from './player-human-flyweb-client';
import { PlayerAi } from './player-ai';
import { Utils } from './utils';
import { GameBase } from './game-base';

export class GameClient extends GameBase {
  constructor(players: Array<Player>, canvas: HTMLCanvasElement) {
    super(players, canvas)
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  const game = new GameClient([
    new PlayerAi(BoardPiece.PLAYER_1, canvas),
    new PlayerHumanFlywebClient(BoardPiece.PLAYER_2, canvas)
  ], canvas)
  game.start()
  canvas.addEventListener('click', async () => {
    if (game.isGameWon) {
      game.reset()
      await Utils.animationFrame()
      game.start()
    }
  })
})
