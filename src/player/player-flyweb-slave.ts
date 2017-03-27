import { Player } from './player';
import { Board, BoardPiece } from '../board';
import { Utils } from '../utils';

export class PlayerFlywebSlave extends Player {
  actionPromiseResolver: any;

  constructor(boardPiece: BoardPiece, canvas: HTMLCanvasElement) {
    super(boardPiece, canvas)
    this.actionPromiseResolver = null
  }

  doAction(column: number) {
    if (this.actionPromiseResolver) {
      this.actionPromiseResolver(column)
    }
  }

  async getAction(board: Board): Promise<number> {
    return new Promise<number>(r => this.actionPromiseResolver = r)
  }
}
