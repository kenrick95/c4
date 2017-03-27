import { Board, BoardPiece } from '../board';

export abstract class Player {
  boardPiece: BoardPiece;
  canvas: HTMLCanvasElement
  abstract async getAction(board: Board): Promise<number>;
  constructor(boardPiece: BoardPiece, canvas: HTMLCanvasElement) {
    this.boardPiece = boardPiece
    this.canvas = canvas
  }
}
