abstract class Player {
  id: number;
  abstract action(board : Board) : number;
  constructor(id : number) {
    this.id = id
  }
}