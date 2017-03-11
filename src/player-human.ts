class PlayerHuman extends Player {
  constructor(id : number) {
    super(id)
  }
  getAction(board : Board) : number {
    return 0
  }
}