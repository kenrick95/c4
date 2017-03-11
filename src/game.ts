class Game {
  board: Board;
  players: Array<Player>;
  constructor() {
    this.board = new Board();
    this.players = [new PlayerHuman(1), new PlayerAi(2)];
  }
  public start() {

  }
}