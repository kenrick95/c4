enum BoardPiece {
  EMPTY,
  PLAYER_1,
  PLAYER_2
}
class Board {
  row: number = 6;
  column: number = 7;
  map: Array<Array<number>>;

  constructor() {
    this.map = []
    for (let i = 0; i < this.row; i++) {
      this.map.push([])
      for (let j = 0; j < this.column; j++) {
        this.map[i].push(BoardPiece.EMPTY)
      }
    }
  }
  
  render() {

  }
}