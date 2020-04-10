import { Board, BoardPiece, BoardBase } from '../board'
import { GameBase } from './game-base'
import { Player, PlayerHuman, PlayerAi } from '../player'
import { Utils } from '../utils'

class GameLocalAi extends GameBase {
  constructor(players: Array<Player>, board: BoardBase) {
    super(players, board)
  }
  afterMove() {
    // no-op
  }
}
export function initGameLocalAi() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }
  const board = new Board(canvas)
  const humanPlayer = new PlayerHuman(BoardPiece.PLAYER_1)
  const game = new GameLocalAi(
    [humanPlayer, new PlayerAi(BoardPiece.PLAYER_2)],
    board
  )

  game.start()
  canvas.addEventListener('click', async (event: MouseEvent) => {
    if (game.isGameWon) {
      game.reset()
      await Utils.animationFrame()
      game.start()
    } else {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const column = Utils.getColumnFromCoord({ x: x, y: y })
      humanPlayer.doAction(column)
    }
  })
}
