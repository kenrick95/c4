import {
  type BoardBase,
  BoardPiece,
  constructMessage,
  GameBase,
  type GameOnlineMessage,
  getColumnFromCoord,
  MESSAGE_TYPE,
  type Player,
  PlayerHuman,
  PlayerShadow,
  parseMessage,
} from '@kenrick95/c4'
import { Board } from '../board'
import { showMessage } from '../utils/message'
import { announce, getMoveRow, renderBoardState } from './game-accessibility'
import { activateGameControls } from './game-controls'

enum GAME_MODE {
  FIRST = BoardPiece.PLAYER_1,
  SECOND = BoardPiece.PLAYER_2,
}

const statusbox = document.querySelector('.statusbox')
const statusboxBodyGame = document.querySelector('.statusbox-body-game')
const statusboxBodyConnection = document.querySelector(
  '.statusbox-body-connection',
)
const statusboxBodyPlayer = document.querySelector('.statusbox-body-player')
const shareButton = document.querySelector(
  '.statusbox-button-share',
) as HTMLDivElement

const C4_SERVER_ENDPOINT =
  import.meta.env.MODE === 'production'
    ? import.meta.env.C4_SERVER_ENDPOINT
      ? import.meta.env.C4_SERVER_ENDPOINT
      : `wss://c4-server.fly.dev/`
    : `ws://${location.hostname}:8080`

export class GameOnline2p extends GameBase {
  controls?: ReturnType<typeof activateGameControls>
  private disposed: boolean = false

  connectionPlayerId: null | string = null
  connectionMatchId: null | string = null
  ws: null | WebSocket = null
  gameMode: GAME_MODE

  playerMain: PlayerHuman
  playerShadow: PlayerShadow

  constructor(
    players: Array<Player>,
    board: BoardBase,
    { gameMode, playerName }: { gameMode: GAME_MODE; playerName: string },
  ) {
    super(players, board)
    this.gameMode = gameMode
    if (gameMode === GAME_MODE.FIRST) {
      this.playerMain = players[0] as PlayerHuman
      this.playerShadow = players[1] as PlayerShadow
    } else {
      this.playerMain = players[1] as PlayerHuman
      this.playerShadow = players[0] as PlayerShadow
    }
    this.playerMain.label = playerName
    this.initConnection()
  }

  end() {
    if (this.disposed) {
      return
    }
    this.disposed = true
    this.controls?.setTurn(false)
    super.end()
    this.endConnection()
    shareButton.removeEventListener('click', this.showShareLink)
  }

  endConnection() {
    const ws = this.ws
    this.ws = null
    ws?.close()
  }

  initConnection() {
    console.log('initConnection')
    this.connectionPlayerId = null
    this.connectionMatchId = null
    if (this.ws) {
      this.ws.close()
    }

    const setStatusDisconnected = () => {
      this.ws = null
      this.stopCurrentSession()
      this.isGameEnded = true
      this.controls?.setTurn(false)
      if (statusboxBodyConnection) {
        statusboxBodyConnection.textContent = 'Disconnected from server'
      }
      if (statusboxBodyGame) {
        statusboxBodyGame.textContent = `Game over`
      }
      if (statusboxBodyPlayer) {
        statusboxBodyPlayer.textContent = `Disconnected from match`
      }
    }

    const ws = new WebSocket(C4_SERVER_ENDPOINT)
    this.ws = ws
    ws.addEventListener('message', (event) => {
      if (this.disposed || this.ws !== ws) {
        return
      }
      this.messageActionHandler(parseMessage(event.data))
    })
    ws.addEventListener('open', () => {
      if (this.disposed || this.ws !== ws) {
        return
      }
      ws.send(
        constructMessage(MESSAGE_TYPE.NEW_PLAYER_CONNECTION_REQUEST, {
          playerName: this.playerMain.label,
        }),
      )
      if (statusboxBodyConnection) {
        statusboxBodyConnection.textContent = 'Connected to server'
      }
      announce('Connected to server.')
      if (statusboxBodyGame) {
        statusboxBodyGame.textContent = ``
      }
      if (statusboxBodyPlayer) {
        statusboxBodyPlayer.textContent = ``
      }
    })
    ws.addEventListener('close', (event) => {
      if (this.disposed || this.ws !== ws) {
        return
      }
      console.log('[ws] close event', event)
      setStatusDisconnected()
    })
    ws.addEventListener('error', (event) => {
      if (this.disposed || this.ws !== ws) {
        return
      }
      console.log('[ws] error event', event)
      setStatusDisconnected()
    })
  }

  initMatch = () => {
    if (this.ws && this.connectionPlayerId) {
      this.ws.send(
        constructMessage(MESSAGE_TYPE.NEW_MATCH_REQUEST, {
          playerId: this.connectionPlayerId,
        }),
      )
    }
  }

  connectToMatch = (matchId: string) => {
    if (!this.ws || !this.connectionPlayerId) {
      return
    }
    this.ws.send(
      constructMessage(MESSAGE_TYPE.CONNECT_MATCH_REQUEST, {
        playerId: this.connectionPlayerId,
        matchId,
      }),
    )
  }

  messageActionHandler = (message: GameOnlineMessage) => {
    switch (message.type) {
      case MESSAGE_TYPE.NEW_PLAYER_CONNECTION_OK:
        {
          this.connectionPlayerId = message.payload.playerId
          if (this.gameMode === GAME_MODE.FIRST) {
            this.initMatch()
          } else if (this.gameMode === GAME_MODE.SECOND) {
            // there is a matchid in URL
            const searchParams = new URLSearchParams(location.search)
            const connectionMatchId = searchParams.get('matchId')
            if (!connectionMatchId) {
              return
            }
            this.connectToMatch(connectionMatchId)
          }
        }
        break
      case MESSAGE_TYPE.NEW_MATCH_OK:
        {
          this.connectionMatchId = message.payload.matchId
          shareButton.classList.remove('hidden')
          shareButton.removeEventListener('click', this.showShareLink)
          shareButton.addEventListener('click', this.showShareLink)
          this.showShareLink()
        }
        break
      case MESSAGE_TYPE.CONNECT_MATCH_OK:
        {
          this.connectionMatchId = message.payload.matchId
        }
        break
      case MESSAGE_TYPE.CONNECT_MATCH_FAIL:
        {
          showMessage({
            title: 'Error',
            messages: ['Failed to connect to match.'],
          })

          if (statusboxBodyConnection) {
            statusboxBodyConnection.textContent = 'Connection error'
          }
        }
        break
      case MESSAGE_TYPE.GAME_READY:
        {
          this.playerShadow.label = message.payload.otherPlayerName
          showMessage({
            title: 'Game started',
            messages: [
              `The first piece should be dropped by ${
                this.isCurrentMoveByCurrentPlayer() ? 'you' : 'the other player'
              }.`,
            ],
          })

          if (statusboxBodyGame) {
            statusboxBodyGame.textContent = 'Wating for move'
          }

          if (statusboxBodyPlayer) {
            const currentPlayer = this.players[this.currentPlayerId]
            statusboxBodyPlayer.textContent =
              `${currentPlayer.label} ${currentPlayer.boardPiece}` +
              ` ` +
              (this.isCurrentMoveByCurrentPlayer()
                ? `(you)`
                : `(the other player)`)
          }
          this.start()
        }
        break
      case MESSAGE_TYPE.MOVE_SHADOW:
        {
          this.playerShadow.doAction(message.payload.column)
        }
        break
      case MESSAGE_TYPE.GAME_ENDED:
        {
          this.stopCurrentSession()
          this.controls?.setTurn(false)
          const { winnerBoardPiece } = message.payload

          const winnerPlayer = this.players.find(
            (player) => player.boardPiece === winnerBoardPiece,
          )

          const messageWinner =
            winnerBoardPiece === BoardPiece.DRAW
              ? `It's a draw`
              : winnerPlayer
                ? `${winnerPlayer.label} ${winnerPlayer.boardPiece} won`
                : `Player ${
                    winnerBoardPiece === BoardPiece.PLAYER_1 ? '1 🔴' : '2 🔵'
                  } won`

          showMessage({
            title: 'Thank you for playing',
            messages: [messageWinner, 'Next game will start in 10 seconds.'],
          })

          if (statusboxBodyGame) {
            statusboxBodyGame.textContent = 'Game over'
          }
          if (statusboxBodyPlayer) {
            statusboxBodyPlayer.textContent = messageWinner
          }
          announce(messageWinner)
        }
        break
      case MESSAGE_TYPE.GAME_RESET:
        {
          this.controls?.setTurn(false)
          this.reset()
          renderBoardState(this.board, this.players)
        }
        break

      case MESSAGE_TYPE.OTHER_PLAYER_HUNGUP:
        {
          this.stopCurrentSession()
          this.controls?.setTurn(false)
          showMessage({
            title: 'Other player disconnected',
            messages: ['Please reload the page to start a new match.'],
          })
          announce('Other player disconnected.')
        }
        break
    }
  }

  showShareLink = () => {
    if (!this.connectionMatchId) {
      return
    }
    const shareUrl = new URL(location.href)
    shareUrl.searchParams.set('matchId', this.connectionMatchId)
    console.log('[url] Share this', shareUrl.toString())
    showMessage({
      title: 'Share this URL',
      messages: ['Share this URL with a friend to start the game.'],
      render: (content) => {
        const label = document.createElement('label')
        label.htmlFor = 'copy-box'
        label.textContent = 'Game URL'
        const copyBox = document.createElement('input')
        copyBox.id = 'copy-box'
        copyBox.className = 'copy-box'
        copyBox.readOnly = true
        copyBox.value = shareUrl.toString()
        const copyButton = document.createElement('button')
        copyButton.type = 'button'
        copyButton.textContent = 'Copy'
        copyButton.addEventListener('click', async () => {
          let isClipboardApiSuccessful = false

          if (navigator.clipboard) {
            try {
              await navigator.clipboard.writeText(copyBox.value)
              isClipboardApiSuccessful = true
            } catch (_err) {}
          }

          if (!isClipboardApiSuccessful) {
            copyBox.select()
            copyBox.setSelectionRange(0, 99999)
            document.execCommand('copy')
          }
        })
        content.append(label, copyBox, copyButton)
        copyBox.focus()
        copyBox.select()
      },
    })
  }

  /**
   * @returns true if the game is waiting for current player to make a move
   */
  isCurrentMoveByCurrentPlayer() {
    if (this.gameMode === GAME_MODE.FIRST) {
      return this.currentPlayerId === 0
    } else {
      return this.currentPlayerId === 1
    }
  }

  beforeMoveApplied = () => {
    this.controls?.setTurn(false)
    if (statusboxBodyGame) {
      const currentPlayer = this.players[this.currentPlayerId]
      statusboxBodyGame.textContent = `Dropping ${currentPlayer.boardPiece} disc`
    }
  }

  waitingForMove = () => {
    renderBoardState(this.board, this.players)
    this.controls?.setTurn(
      this.isMoveAllowed &&
        !this.isGameWon &&
        !this.isGameEnded &&
        this.isCurrentMoveByCurrentPlayer(),
    )
    if (statusboxBodyGame) {
      statusboxBodyGame.textContent = 'Wating for move'
    }

    if (statusboxBodyPlayer) {
      const currentPlayer = this.players[this.currentPlayerId]
      statusboxBodyPlayer.textContent =
        `${currentPlayer.label} ${currentPlayer.boardPiece}` +
        ` ` +
        (this.isCurrentMoveByCurrentPlayer() ? `(you)` : `(the other player)`)
      announce(
        `${currentPlayer.label}'s turn${
          this.isCurrentMoveByCurrentPlayer() ? ' (you)' : ''
        }.`,
      )
    }
  }

  afterMove = (action: number) => {
    renderBoardState(this.board, this.players)
    const currentPlayer = this.players[this.currentPlayerId]
    const row = getMoveRow(this.board, action)
    announce(
      `${currentPlayer.label} placed a disc in column ${action + 1}${
        row ? `, row ${row}` : ''
      }.`,
    )
    if (!this.connectionPlayerId || !this.connectionMatchId) {
      return
    }
    if (this.ws && this.isCurrentMoveByCurrentPlayer()) {
      this.ws.send(
        constructMessage(MESSAGE_TYPE.MOVE_MAIN, {
          playerId: this.connectionPlayerId,
          matchId: this.connectionMatchId,
          column: action,
        }),
      )
    }
  }

  announceWinner(winnerBoardPiece: BoardPiece) {
    this.controls?.setTurn(false)
    super.announceWinner(winnerBoardPiece)
    // Do nothing here, will wait for server to announce
  }
}

export function initGameOnline2p(playerName: string) {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }

  const searchParams = new URLSearchParams(location.search)
  const connectionMatchId = searchParams.get('matchId')
  const gameMode = connectionMatchId ? GAME_MODE.SECOND : GAME_MODE.FIRST

  const board = new Board(canvas)
  const players =
    gameMode === GAME_MODE.FIRST
      ? [
          new PlayerHuman(BoardPiece.PLAYER_1, playerName),
          new PlayerShadow(BoardPiece.PLAYER_2, `Other player`),
        ]
      : [
          new PlayerShadow(BoardPiece.PLAYER_1, `Other player`),
          new PlayerHuman(BoardPiece.PLAYER_2, playerName),
        ]

  const game = new GameOnline2p(players, board, {
    gameMode,
    playerName,
  })
  let disposed = false
  statusbox?.classList.remove('hidden')
  statusboxBodyConnection?.classList.remove('hidden')
  renderBoardState(board, players)

  function playColumn(column: number) {
    if (disposed) {
      return
    }
    if (
      !game.isGameWon &&
      !game.isGameEnded &&
      game.isMoveAllowed &&
      game.isCurrentMoveByCurrentPlayer()
    ) {
      game.playerMain.doAction(column)
    }
  }

  function handleCanvasClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    controls.playColumn(getColumnFromCoord({ x: x, y: y }))
  }

  const controls = activateGameControls(
    playColumn,
    (column) => board.map[0][column] === BoardPiece.EMPTY,
  )
  game.controls = controls
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
      statusbox?.classList.add('hidden')
    },
  }
}
