import { Player, PlayerHuman } from '.';
import { Board, BoardPiece } from '../board';
import { Utils } from '../utils';

export class PlayerFlywebMaster extends PlayerHuman {
  clickPromiseResolver: any;
  socket: WebSocket;

  constructor(boardPiece: BoardPiece, canvas: HTMLCanvasElement) {
    super(boardPiece, canvas)
    this.clickPromiseResolver = null
  }

  doAction(column: number) {
    super.doAction(column)
    if (!this.socket) {
      throw Error('PlayerFlywebMaster need WebSocket object')
    }
  }

  async getAction(board: Board): Promise<number> {
    return new Promise<number>(r => this.clickPromiseResolver = r)
  }
}
