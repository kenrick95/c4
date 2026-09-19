import { type BoardBase, BoardPiece, PlayerAi } from '@kenrick95/c4'
import { Board } from '../board'
import { animationFrame } from '../utils/animate-frame'
import { GameLocal } from './game-local'

const statusbox = document.querySelector('.statusbox')
const statusboxBodyGame = document.querySelector('.statusbox-body-game')
const statusboxBodyConnection = document.querySelector(
  '.statusbox-body-connection',
)
const statusboxBodyPlayer = document.querySelector('.statusbox-body-player')
const playAgainButton = document.querySelector(
  '.statusbox-button-play-again',
) as HTMLButtonElement

class GameAiVsAi extends GameLocal {
  constructor(players: Array<PlayerAi>, board: BoardBase) {
    super(players, board)
  }
  announceWinner(winnerBoardPiece: BoardPiece): void {
    super.announceWinner(winnerBoardPiece)
  }
}
export function initGameAiVsAi() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }
  const board = new Board(canvas)
  const firstPlayer = new PlayerAi(BoardPiece.PLAYER_1, `AI Player 1`)
  const secondPlayer = new PlayerAi(BoardPiece.PLAYER_2, `AI Player 2`)
  const game = new GameAiVsAi([firstPlayer, secondPlayer], board)
  let disposed = false

  statusbox?.classList.remove('hidden')
  statusboxBodyConnection?.classList.add('hidden')
  playAgainButton?.classList.add('hidden')
  game.start()

  async function restartGame() {
    if (disposed || !game.isGameWon) {
      return
    }
    playAgainButton?.classList.add('hidden')
    game.reset()
    await animationFrame()
    if (disposed) {
      return
    }
    game.start()
  }

  return {
    end: () => {
      if (disposed) {
        return
      }
      disposed = true
      game.end()
      board.dispose()
      playAgainButton?.classList.add('hidden')
    },
    restart: restartGame,
  }
}
