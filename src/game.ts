import {Board, BoardPiece} from './board';
import {Player} from './player';
import {PlayerHuman} from './player-human';
import {PlayerAi} from './player-ai';

export class Game {
  board: Board;
  players: Array<Player>;
  currentPlayerId: number;
  isMoveAllowed: boolean;

  constructor() {
    this.board = new Board(document.querySelector('canvas'));
    this.players = [new PlayerHuman(BoardPiece.PLAYER_1), new PlayerAi(BoardPiece.PLAYER_2)];
    this.currentPlayerId = 0;
    this.isMoveAllowed = false;
  }
  start() {
    this.isMoveAllowed = true;
  }
  move() {
    if (!this.isMoveAllowed) {
      return
    }
    const currentPlayer = this.players[this.currentPlayerId];
    let actionSuccesful = false;
    while (!actionSuccesful) {
      const action = currentPlayer.getAction(this.board);
      actionSuccesful = this.board.applyPlayerAction(currentPlayer, action);
    }
    this.currentPlayerId = this.getNextPlayer();
  }
  private getNextPlayer() {
    return (this.currentPlayerId === 0) ? 1 : 0;
  }
}