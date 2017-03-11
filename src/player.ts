abstract class Player {
  id: number;
  abstract getAction(board : Board) : number;
  constructor(id : number) {
    this.id = id
  }
}