import { Board } from '../board'
import { BoardBase, BoardPiece } from '@kenrick95/c4'
import { GameBase } from '@kenrick95/c4'
import { Player, PlayerHuman, PlayerAi } from '@kenrick95/c4'
import { getColumnFromCoord } from '@kenrick95/c4'
import { showMessage } from '../utils/message'
import { animationFrame } from '../utils/animate-frame'

const statusbox = document.querySelector('.statusbox')
const statusboxBodyGame = document.querySelector('.statusbox-body-game')
const statusboxBodyConnection = document.querySelector(
  '.statusbox-body-connection',
)
const statusboxBodyPlayer = document.querySelector('.statusbox-body-player')

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
    message +=
      '.<br />After dismissing this message, click the board to reset game.'
    showMessage(message)

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

  game.start()
  if (statusboxBodyGame) {
    statusboxBodyGame.textContent = 'Wating for move'
  }

  if (statusboxBodyPlayer) {
    statusboxBodyPlayer.textContent = `${firstPlayer.label} ${firstPlayer.boardPiece}`
  }

  async function handleCanvasClick(event: MouseEvent) {
    if (game.isGameWon) {
      game.reset()
      await animationFrame()
      game.start()
    } else {
      if (!canvas) {
        return
      }
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const column = getColumnFromCoord({ x, y })
      if (game.currentPlayerId === 0) {
        firstPlayer.doAction(column)
      } else if (
        game.currentPlayerId === 1 &&
        secondPlayer instanceof PlayerHuman
      ) {
        secondPlayer.doAction(column)
      }
    }
  }

  canvas.addEventListener('click', handleCanvasClick)
  return {
    end: () => {
      game.end()
      canvas.removeEventListener('click', handleCanvasClick)
      statusbox?.classList.add('hidden')
    },
  }
}
