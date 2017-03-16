import { PlayerHuman } from './player-human'
import { BoardPiece } from './board';

export class PlayerHumanFlywebClient extends PlayerHuman {
  constructor(boardPiece: BoardPiece, canvas: HTMLCanvasElement) {
    super(boardPiece, canvas)
  }
}
