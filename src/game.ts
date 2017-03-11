class Game {
  board: Board;
  players: Array<Player>;
  currentPlayerId: number;
  isMoveAllowed: boolean;

  constructor() {
    this.board = new Board(document.querySelector('canvas'));
    this.players = [new PlayerHuman(0), new PlayerAi(1)];
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
    const action = currentPlayer.getAction(this.board);
    this.board.applyPlayerAction(currentPlayer, action);
    this.currentPlayerId = this.getNextPlayer();
  }
  private getNextPlayer() {
    return (this.currentPlayerId === 0) ? 1 : 0;
  }
}