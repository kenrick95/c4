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
import { announce, getMoveRow, renderBoardState } from './game-accessibility'
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
  controls?: ReturnType<typeof activateGameControls>
  private pendingMoveAnnouncement: string | undefined

  constructor(players: Array<Player>, board: BoardBase) {
    super(players, board)
  }
  reset() {
    this.pendingMoveAnnouncement = undefined
    super.reset()
  }
  beforeMoveApplied() {
    this.controls?.setTurn(false)
    if (statusboxBodyGame) {
      const currentPlayer = this.players[this.currentPlayerId]
      statusboxBodyGame.textContent = `Dropping ${currentPlayer.boardPiece} disc`
    }
  }
  waitingForMove() {
    renderBoardState(this.board, this.players)
    this.controls?.setTurn(
      this.isMoveAllowed &&
        !this.isGameWon &&
        !this.isGameEnded &&
        this.players[this.currentPlayerId] instanceof PlayerHuman,
    )
    if (!this.isMoveAllowed || this.isGameWon) {
      return
    }

    if (statusboxBodyGame) {
      statusboxBodyGame.textContent = 'Wating for move'
    }

    // `currentPlayerId` is not updated yet
    const currentPlayer = this.players[this.currentPlayerId]
    if (statusboxBodyPlayer) {
      statusboxBodyPlayer.textContent = `${currentPlayer.label} ${currentPlayer.boardPiece}`
    }
    const turnAnnouncement = `${currentPlayer.label}'s turn.`
    announce(
      this.pendingMoveAnnouncement
        ? `${this.pendingMoveAnnouncement} It is now ${turnAnnouncement}`
        : turnAnnouncement,
    )
    this.pendingMoveAnnouncement = undefined
  }
  afterMove(action: number) {
    renderBoardState(this.board, this.players)
    const currentPlayer = this.players[this.currentPlayerId]
    const row = getMoveRow(this.board, action)
    this.pendingMoveAnnouncement = `${currentPlayer.label} placed a disc in column ${action + 1}${
      row ? `, row ${row}` : ''
    }.`
  }

  announceWinner(winnerBoardPiece: BoardPiece) {
    this.controls?.setTurn(false)
    this.pendingMoveAnnouncement = undefined
    super.announceWinner(winnerBoardPiece)

    if (winnerBoardPiece === BoardPiece.EMPTY) {
      return
    }
    let winnerPlayer: Player | undefined
    let result = ''
    if (winnerBoardPiece === BoardPiece.DRAW) {
      result = `It's a draw.`
    } else {
      winnerPlayer = this.players.find(
        (player) => player.boardPiece === winnerBoardPiece,
      )
      if (winnerPlayer) {
        result = `${winnerPlayer.label} won.`
      } else {
        result = `Player ${winnerBoardPiece} won.`
      }
    }
    renderBoardState(this.board, this.players)
    const messageDialog = showMessage({
      title: 'Thank you for playing.',
      messages: [result, 'Use the Play again button to start a new game.'],
    })
    messageDialog?.addEventListener('close', () => playAgainButton?.focus(), {
      once: true,
    })
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
    announce(result)
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
  let disposed = false
  statusbox?.classList.remove('hidden')
  statusboxBodyConnection?.classList.add('hidden')
  playAgainButton?.classList.add('hidden')

  if (statusboxBodyGame) {
    statusboxBodyGame.textContent = 'Wating for move'
  }

  if (statusboxBodyPlayer) {
    statusboxBodyPlayer.textContent = `${firstPlayer.label} ${firstPlayer.boardPiece}`
  }
  renderBoardState(board, [firstPlayer, secondPlayer])

  function playColumn(column: number) {
    if (disposed || game.isGameWon || game.isGameEnded || !game.isMoveAllowed) {
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

  function handleCanvasClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    controls.playColumn(getColumnFromCoord({ x, y }))
  }

  const controls = activateGameControls(
    playColumn,
    (column) => board.map[0][column] === BoardPiece.EMPTY,
  )
  game.controls = controls
  game.start()
  canvas.addEventListener('click', handleCanvasClick)
  return {
    end: () => {
      if (disposed) {
        return
      }
      disposed = true
      game.end()
      controls.dispose()
      canvas.removeEventListener('click', handleCanvasClick)
      board.dispose()
      playAgainButton?.classList.add('hidden')
      statusbox?.classList.add('hidden')
    },
    restart: restartGame,
  }
}
