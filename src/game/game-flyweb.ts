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

  constructor(players: Array<Player>, canvas: HTMLCanvasElement, clientMode = false) {
    super(players, canvas)
    console.log('clientMode', clientMode)
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
  initClient() {
    this.handleClientWs()
  }
  handleClientWs() {
    const socket = new WebSocket('ws://' + window.location.host + '/api/ws')
    this.playerMaster.socket = socket

    socket.onopen = (evt) => {
      console.log('socket.onopen()', evt)
    }

    socket.onclose = (evt) => {
      console.log('socket.onclose()', evt)
    }

    socket.onerror = (evt) => {
      console.log('socket.onerror()', evt)
      socket.close()
    }

    socket.onmessage = (evt) => {
      console.log('socket.onmessage()', evt)

      var message = JSON.parse(evt.data)
      if (!message) {
        return
      }

      if (message.type === 'start') {
        alert('Welcome! Connection to Player 1 has been established.')
      } else if (message.type === 'move') {
        this.playerSlave.doAction(message.data.column)
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
      console.log('socket.onopen()', evt, socket)
      if (this.isAcceptingPlayer) {
        this.isAcceptingPlayer = false
        socket.send(JSON.stringify({
          type: 'start',
          data: {
            accepted: this.isAcceptingPlayer
          }
        }))
        alert('Connection to Player 2 has been established.')
      } else {
        socket.close()
      }
    }

    socket.onclose = (evt) => {
      console.log('socket.onclose()', evt)
      this.isAcceptingPlayer = true
    }

    socket.onerror = (evt) => {
      console.log('socket.onerror()', evt)
      this.isAcceptingPlayer = true
      socket.close()
    }

    socket.onmessage = (evt) => {
      console.log('socket.onmessage()', evt)
      const message = JSON.parse(evt.data)
      if (!message) {
        return
      }

      this.playerSlave.doAction(message.data.column)
    }
  }
  async initServer() {
    if (!('publishServer' in this.browser)) {
      window.alert('FlyWeb requires Firefox Developer Edition and enabling a flag at about:config')
      return false
    }
    const server = await this.browser.publishServer('c4 - Connect Four')
    server.onfetch = async (evt: IFlyWebFetchEvent) => {
      var urlParts = evt.request.url.split('?');

      var url = urlParts[0];
      var params = new URLSearchParams(urlParts[1]);
      console.log('Requested for url: ', url, params)

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
  document.addEventListener('DOMContentLoaded', () => {
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
    game.start()
    canvas.addEventListener('click', async () => {
      if (game.isGameWon) {
        game.reset()
        await Utils.animationFrame()
        game.start()
      }
    })
  })
}
