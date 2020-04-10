import { Board, BoardBase, BoardPiece } from '../board'
import { GameBase } from './game-base'
import { Player, PlayerHuman } from '../player'
import { Utils } from '../utils'

// TODO: This assumes the current user; not the other user, need another type to act as the other user
export class GameOnline2p extends GameBase {
  constructor(players: Array<Player>, board: BoardBase) {
    super(players, board)
  }
  afterMove() {
    // no-op
  }
}

// TODO: Need another init function, for when starting as 2nd player
export function initGameOnline2p() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }
  const ws = new WebSocket('ws://localhost:8080')
  ws.addEventListener('message', event => {
    console.log('[ws]', event)
  })
  ws.addEventListener('open', event => {
    ws.send('hello')
  })

  const board = new Board(canvas)
  const humanPlayers = [
    new PlayerHuman(BoardPiece.PLAYER_1),
    new PlayerHuman(BoardPiece.PLAYER_2) // TODO: Need one more Player type, to act as the 2nd player over the net
  ]

  const game = new GameOnline2p(humanPlayers, board)
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
