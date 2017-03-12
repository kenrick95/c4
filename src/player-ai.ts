import { Player } from './player';
import { Board, BoardPiece } from './board';
import { Utils } from './utils';

export class PlayerAi extends Player {
  constructor(boardPiece: BoardPiece) {
    super(boardPiece)
  }
  async getAction(board: Board): Promise<number> {
    return Utils.getRandomColumnNumber();
  }
}
