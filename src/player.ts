import {Board, BoardPiece} from './board';

export abstract class Player {
  boardPiece: BoardPiece;
  abstract getAction(board : Board) : number;
  constructor(boardPiece : BoardPiece) {
    this.boardPiece = boardPiece
  }
}