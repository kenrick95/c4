import { Board, BoardPiece } from './board';

export abstract class Player {
  boardPiece: BoardPiece;
  abstract async getAction(board: Board): Promise<number>;
  constructor(boardPiece: BoardPiece) {
    this.boardPiece = boardPiece
  }
}