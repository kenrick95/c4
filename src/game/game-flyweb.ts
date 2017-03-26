import { GameBase } from './game-base';
import { Player, PlayerFlywebMaster, PlayerFlywebSlave } from '../player'
import { INavigator } from '../flyweb-utils/Navigator';
import { IFlyWebFetchEvent, IFlyWebSocketEvent } from '../flyweb-utils/FlyWeb';
import { Board, BoardPiece } from '../board';
import { Utils } from '../utils';

class GameFlyweb extends GameBase {
  readonly BASE_URL = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
  readonly browser = <INavigator>navigator;
  isAcceptingPlayer: boolean = true;
  playerMaster: PlayerFlywebMaster;
  playerSlave: PlayerFlywebSlave;
  clientMode: boolean;

  constructor(players: Array<Player>, canvas: HTMLCanvasElement, clientMode = false) {
    super(players, canvas)
    this.clientMode = clientMode
    if (clientMode) {
      this.playerSlave = <PlayerFlywebSlave>players[0]
      this.playerMaster = <PlayerFlywebMaster>players[1]
      this.initClient()
    } else {
      this.playerMaster = <PlayerFlywebMaster>players[0]
      this.playerSlave = <PlayerFlywebSlave>players[1]
      this.initServer()
    }
  }

  afterMove(action: number) {
    if ((this.clientMode && this.currentPlayerId === 1) || (!this.clientMode && this.currentPlayerId === 0)) {
      this.playerMaster.socket.send(JSON.stringify({
        type: 'move',
        data: {
          column: action,
          from: this.currentPlayerId === 0 ? 'server' : 'client'
        }
      }))
    }
  }

  initClient() {
    this.handleClientWs()
  }
  handleClientWs() {
    const socket = new WebSocket('ws://' + window.location.host + '/api/ws')
    this.playerMaster.socket = socket

    socket.onopen = (evt) => {
      console.log('client socket.onopen()', evt)
    }

    socket.onclose = (evt) => {
      console.log('client socket.onclose()', evt)
    }

    socket.onerror = (evt) => {
      console.log('client socket.onerror()', evt)
      socket.close()
    }

    socket.onmessage = async (evt) => {
      console.log('client socket.onmessage()', evt)

      var message = JSON.parse(evt.data)
      if (!message) {
        return
      }
      if (message.from === 'client') {
        return
      }

      if (message.type === 'start') {
        Utils.showMessage('<h1>Welcome!</h1>Connection to Player 1 has been established. Game started!')
        this.start()
      } else if (message.type === 'move') {
        this.playerSlave.doAction(message.data.column)
      } else if (message.type === 'reset') {
        this.reset()
        await Utils.animationFrame()
        this.start()
      }
    }
  }

  async fetch(evt: IFlyWebFetchEvent, url: string) {
    const response = await fetch(this.BASE_URL + url)
    const contentType = response.headers.get('Content-Type')
    const blob = await response.blob()
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0
    }
    console.log('Response is: ', url)
    evt.respondWith(new Promise<Response>(r => r(new Response(blob, { headers }))))
  }
  handleWsServer(evt: IFlyWebSocketEvent) {
    const socket = evt.accept()
    this.playerMaster.socket = socket

    socket.onopen = (evt) => {
      console.log('server socket.onopen()', evt, socket)
      if (this.isAcceptingPlayer) {
        this.isAcceptingPlayer = false
        socket.send(JSON.stringify({
          type: 'start',
          data: {
            accepted: this.isAcceptingPlayer
          }
        }))
        Utils.showMessage('<h1>Welcome!</h1>Connection to Player 2 has been established. Game started!')
        this.start()
      } else {
        socket.close()
      }
    }

    socket.onclose = (evt) => {
      console.log('server socket.onclose()', evt)
      this.isAcceptingPlayer = true
      this.reset()
    }

    socket.onerror = (evt) => {
      console.log('server socket.onerror()', evt)
      this.isAcceptingPlayer = true
      socket.close()
    }

    socket.onmessage = async (evt) => {
      console.log('server socket.onmessage()', evt)
      const message = JSON.parse(evt.data)
      if (!message) {
        return
      }
      if (message.from === 'server') {
        return
      }

      if (message.type === 'move') {
        this.playerSlave.doAction(message.data.column)
      } else if (message.type === 'reset') {
        this.reset()
        await Utils.animationFrame()
        this.start()
      }
    }
  }
  async initServer() {
    if (!('publishServer' in this.browser)) {
      Utils.showMessage(`<h1>Attention!</h1>
        FlyWeb requires Firefox Developer Edition or Nightly,
        and enabling "dom.flyweb.enabled" flag at about:config`)
      return false
    }
    const server = await this.browser.publishServer('c4 - Connect Four')
    server.onfetch = async (evt: IFlyWebFetchEvent) => {
      var urlParts = evt.request.url.split('?');

      var url = urlParts[0];
      var params = new URLSearchParams(urlParts[1]);
      console.log('me Requested for url: ', url, params)

      switch (url) {
        case '/dist/app.js':
          await this.fetch(evt, '/dist/app-flyweb-client.js')
          break;
        default: {
          await this.fetch(evt, url)
        }
      }
    }

    server.onwebsocket = (evt: IFlyWebSocketEvent) => {
      var url = evt.request.url;
      if (url === '/api/ws') {
        this.handleWsServer(evt)
      }
    }
  }
}

export function initGameFlyweb({ clientMode = false}) {
  const canvas = document.querySelector('canvas')
  let players: Array<Player> = null
  if (clientMode) {
    players = [
      new PlayerFlywebSlave(BoardPiece.PLAYER_1, canvas),
      new PlayerFlywebMaster(BoardPiece.PLAYER_2, canvas)
    ]
  } else {
    players = [
      new PlayerFlywebMaster(BoardPiece.PLAYER_1, canvas),
      new PlayerFlywebSlave(BoardPiece.PLAYER_2, canvas)
    ]
  }

  const game = new GameFlyweb(players, canvas, clientMode)
  Utils.showMessage('<h1>Welcome!</h1>Game will start after Player 2 has been connected.')
  canvas.addEventListener('click', async () => {
    if (game.isGameWon) {
      game.reset()
      if (game.playerMaster && game.playerMaster.socket) {
        game.playerMaster.socket.send(JSON.stringify({
          type: 'reset',
          data: {
            reset: true
          }
        }))
      }
      await Utils.animationFrame()
      game.start()
    }
  })
}
