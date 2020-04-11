import { Board } from '../board'
import { BoardBase, BoardPiece } from '@kenrick95/c4-core/board'
import {
  GameBase,
  MESSAGE_TYPE,
  constructMessage,
  parseMessage
} from '@kenrick95/c4-core/game'
import { Player, PlayerHuman, PlayerShadow } from '@kenrick95/c4-core/player'
import { Utils } from '@kenrick95/c4-core/utils'

enum GAME_MODE {
  FIRST = BoardPiece.PLAYER_1,
  SECOND = BoardPiece.PLAYER_2
}

export class GameOnline2p extends GameBase {
  connectionPlayerId: null | string = null
  connectionMatchId: null | string = null
  ws: null | WebSocket = null
  gameMode: GAME_MODE

  playerMain: PlayerHuman
  playerShadow: PlayerShadow

  constructor(
    players: Array<Player>,
    board: BoardBase,
    { gameMode }: { gameMode: GAME_MODE }
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
    this.initConnection()
  }

  initConnection() {
    this.connectionPlayerId = null
    this.connectionMatchId = null
    if (this.ws) {
      this.ws.close()
    }

    this.ws = new WebSocket(`ws://${location.hostname}:8080`)
    this.ws.addEventListener('message', event => {
      this.messageActionHandler(parseMessage(event.data))
    })
    this.ws.addEventListener('open', () => {
      if (this.ws) {
        this.ws.send(
          constructMessage(MESSAGE_TYPE.NEW_PLAYER_CONNECTION_REQUEST)
        )
      }
    })
    this.ws.addEventListener('close', event => {
      if (this.ws) {
        console.log('[ws] close event', event)
        // this.ws.send(
        //   constructMessage(MESSAGE_TYPE.HUNG_UP, {
        //     playerId: this.connectionPlayerId
        //   })
        // )
      }
    })
  }

  initMatch = () => {
    if (this.ws) {
      this.ws.send(
        constructMessage(MESSAGE_TYPE.NEW_MATCH_REQUEST, {
          playerId: this.connectionPlayerId
        })
      )
    }
  }

  connectToMatch = (matchId: string) => {
    if (!this.ws) {
      return
    }
    this.ws.send(
      constructMessage(MESSAGE_TYPE.CONNECT_MATCH_REQUEST, {
        playerId: this.connectionPlayerId,
        matchId
      })
    )
  }

  messageActionHandler = ({
    type,
    payload
  }: {
    type: MESSAGE_TYPE
    payload: any
  }) => {
    // TODO: Missing cases like game won/draw, game reset, other party disconnected,
    switch (type) {
      case MESSAGE_TYPE.NEW_PLAYER_CONNECTION_OK:
        {
          this.connectionPlayerId = payload.playerId
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
          this.connectionMatchId = payload.matchId
          const shareUrl = `${location.origin}/?matchId=${this.connectionMatchId}`
          console.log('[url] Share this', shareUrl)
          Utils.showMessage(
            `<h1>Share this URL</h1>` +
              `Please share this URL to your friend to start the game: ` +
              `<input type="text" id="copy-box" readonly value="${shareUrl}" />` +
              `<button type="button" id="copy-button">Copy</button>`
          )
          document
            .getElementById('copy-button')
            ?.addEventListener('click', () => {
              const copyBox: HTMLInputElement | null = document.getElementById(
                'copy-box'
              ) as HTMLInputElement

              copyBox?.select()
              copyBox?.setSelectionRange(0, 99999)
              document.execCommand('copy')
            })
        }
        break
      case MESSAGE_TYPE.CONNECT_MATCH_OK:
        {
          this.connectionMatchId = payload.matchId
        }
        break
      case MESSAGE_TYPE.CONNECT_MATCH_FAIL:
        {
          Utils.showMessage(`<h1>Error</h1> Failed to connect to match.`)
        }
        break
      case MESSAGE_TYPE.GAME_READY:
        {
          Utils.showMessage(
            `<h1>Game started</h1> The first piece should be dropped by ${
              this.isCurrentMoveByCurrentPlayer() ? 'you' : 'the other player'
            }`
          )
          this.start()
        }
        break
      case MESSAGE_TYPE.MOVE_SHADOW: {
        this.playerShadow.doAction(payload.column)
      }
    }
  }

  /**
   * @returns true if the game is waiting for current player to make a move
   */
  isCurrentMoveByCurrentPlayer() {
    return this.currentPlayerId + 1 === this.gameMode
  }

  afterMove = (action: number) => {
    if (this.ws && this.isCurrentMoveByCurrentPlayer()) {
      this.ws.send(
        constructMessage(MESSAGE_TYPE.MOVE_MAIN, {
          playerId: this.connectionPlayerId,
          matchId: this.connectionMatchId,
          column: action
        })
      )
    }
  }
}

export function initGameOnline2p() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }

  const searchParams = new URLSearchParams(location.search)
  const connectionMatchId = searchParams.get('matchId')
  const gameMode = !!connectionMatchId ? GAME_MODE.SECOND : GAME_MODE.FIRST

  console.log('gameMode', gameMode)

  const board = new Board(canvas)
  const players =
    gameMode === GAME_MODE.FIRST
      ? [
          new PlayerHuman(BoardPiece.PLAYER_1),
          new PlayerShadow(BoardPiece.PLAYER_2)
        ]
      : [
          new PlayerShadow(BoardPiece.PLAYER_1),
          new PlayerHuman(BoardPiece.PLAYER_2)
        ]

  const game = new GameOnline2p(players, board, {
    gameMode
  })

  // wait till game ready to start

  // game.start()
  canvas.addEventListener('click', async (event: MouseEvent) => {
    if (game.isGameWon) {
      // TODO: Decide who can reset game??
      game.reset()
      // TODO: Game start should be decided by server
      // await Utils.animationFrame()
      // game.start()
    } else {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const column = Utils.getColumnFromCoord({ x: x, y: y })
      game.playerMain.doAction(column)
    }
  })
}
