import { BoardBase, BoardPiece } from '../board'

export abstract class Player {
  boardPiece: BoardPiece
  abstract getAction(board: BoardBase): Promise<number>
  constructor(boardPiece: BoardPiece) {
    this.boardPiece = boardPiece
  }
}
