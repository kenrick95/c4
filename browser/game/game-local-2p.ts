import { Board } from '../board'
import { BoardBase, BoardPiece } from '@kenrick95/c4-core/board'
import { GameBase } from '@kenrick95/c4-core/game'
import { Player, PlayerHuman } from '@kenrick95/c4-core/player'
import { Utils } from '@kenrick95/c4-core/utils'

class GameLocal2p extends GameBase {
  constructor(players: Array<Player>, board: BoardBase) {
    super(players, board)
  }
  afterMove() {
    // no-op
  }
}
export function initGameLocal2p() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }
  const board = new Board(canvas)
  const humanPlayers = [
    new PlayerHuman(BoardPiece.PLAYER_1),
    new PlayerHuman(BoardPiece.PLAYER_2),
  ]

  const game = new GameLocal2p(humanPlayers, board)
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
      humanPlayers[game.currentPlayerId].doAction(column)
    }
  })
}
