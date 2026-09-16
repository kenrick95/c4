import {
  type BoardBase,
  BoardPiece,
  GameBase,
  getColumnFromCoord,
  type Player,
  type PlayerAi,
  PlayerHuman,
} from '@kenrick95/c4'
import { Board } from '../board'
import { animationFrame } from '../utils/animate-frame'
import { showMessage } from '../utils/message'
import { activateGameControls } from './game-controls'

const statusbox = document.querySelector('.statusbox')
const statusboxBodyGame = document.querySelector('.statusbox-body-game')
const statusboxBodyConnection = document.querySelector(
  '.statusbox-body-connection',
)
const statusboxBodyPlayer = document.querySelector('.statusbox-body-player')
const playAgainButton = document.querySelector(
  '.statusbox-button-play-again',
) as HTMLButtonElement

export class GameLocal extends GameBase {
  constructor(players: Array<Player>, board: BoardBase) {
    super(players, board)
  }
  beforeMoveApplied() {
    if (statusboxBodyGame) {
      const currentPlayer = this.players[this.currentPlayerId]
      statusboxBodyGame.textContent = `Dropping ${currentPlayer.boardPiece} disc`
    }
  }
  waitingForMove() {
    if (!this.isMoveAllowed || this.isGameWon) {
      return
    }

    if (statusboxBodyGame) {
      statusboxBodyGame.textContent = 'Wating for move'
    }

    if (statusboxBodyPlayer) {
      // `currentPlayerId` is not updated yet
      const currentPlayer = this.players[this.currentPlayerId]
      statusboxBodyPlayer.textContent = `${currentPlayer.label} ${currentPlayer.boardPiece}`
    }
  }
  afterMove() {
    // no-op
  }

  announceWinner(winnerBoardPiece: BoardPiece) {
    super.announceWinner(winnerBoardPiece)

    if (winnerBoardPiece === BoardPiece.EMPTY) {
      return
    }
    let winnerPlayer: Player | undefined
    let message = '<h1>Thank you for playing.</h1>'
    if (winnerBoardPiece === BoardPiece.DRAW) {
      message += `It's a draw`
    } else {
      winnerPlayer = this.players.find(
        (player) => player.boardPiece === winnerBoardPiece,
      )
      if (winnerPlayer) {
        message += `${winnerPlayer.label} ${winnerPlayer.boardPiece} won`
      } else {
        message += `Player ${winnerBoardPiece} won`
      }
    }
    message += '.<br />Use the Play again button to start a new game.'
    showMessage(message)
    playAgainButton?.classList.remove('hidden')

    if (statusboxBodyGame) {
      statusboxBodyGame.textContent = 'Game over'
    }
    if (statusboxBodyPlayer) {
      statusboxBodyPlayer.textContent =
        winnerBoardPiece === BoardPiece.DRAW
          ? `It's a draw`
          : winnerPlayer
            ? `${winnerPlayer.label} ${winnerPlayer.boardPiece} won`
            : `Player ${
                winnerBoardPiece === BoardPiece.PLAYER_1 ? '1 🔴' : '2 🔵'
              } won`
    }
  }
}
export function initGameLocal(
  GameLocalConstructor: typeof GameLocal,
  firstPlayer: PlayerHuman,
  secondPlayer: PlayerHuman | PlayerAi,
) {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }
  const board = new Board(canvas)
  const game = new GameLocalConstructor([firstPlayer, secondPlayer], board)
  statusbox?.classList.remove('hidden')
  statusboxBodyConnection?.classList.add('hidden')
  playAgainButton?.classList.add('hidden')

  game.start()
  if (statusboxBodyGame) {
    statusboxBodyGame.textContent = 'Wating for move'
  }

  if (statusboxBodyPlayer) {
    statusboxBodyPlayer.textContent = `${firstPlayer.label} ${firstPlayer.boardPiece}`
  }

  function playColumn(column: number) {
    if (game.isGameWon || !game.isMoveAllowed) {
      return
    }
    if (game.currentPlayerId === 0) {
      firstPlayer.doAction(column)
    } else if (
      game.currentPlayerId === 1 &&
      secondPlayer instanceof PlayerHuman
    ) {
      secondPlayer.doAction(column)
    }
  }

  async function restartGame() {
    if (!game.isGameWon) {
      return
    }
    playAgainButton?.classList.add('hidden')
    game.reset()
    await animationFrame()
    game.start()
  }

  function handleCanvasClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    playColumn(getColumnFromCoord({ x, y }))
  }

  const deactivateGameControls = activateGameControls(playColumn)
  canvas.addEventListener('click', handleCanvasClick)
  return {
    end: () => {
      game.end()
      deactivateGameControls()
      canvas.removeEventListener('click', handleCanvasClick)
      playAgainButton?.classList.add('hidden')
      statusbox?.classList.add('hidden')
    },
    restart: restartGame,
  }
}
