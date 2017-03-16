/**
 * EXPERIMENTAL
 * Based on flyweb example "photo-wall"
 * 2-player not achievable yet, FlyWeb clients currently could play locally with AI :P
 * TODO:
 * Client should have:
 * - "Player" that acts as message receiver showing Server moves
 * - Real human player, clicking, etc. and send message to server
 * Server should have:
 * - "Player" that acts as message receiver showing Client moves
 * - Real human player, clicking, etc. and broadcast message to client
 */
import { PlayerHuman } from './player-human'
import { BoardPiece } from './board';
import { INavigator } from './player-human-flyweb-utils/Navigator';
import { IFlyWebFetchEvent } from './player-human-flyweb-utils/FlyWeb';

export class PlayerHumanFlyweb extends PlayerHuman {
  readonly BASE_URL = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
  readonly browser = <INavigator>navigator;

  constructor(boardPiece: BoardPiece, canvas: HTMLCanvasElement) {
    super(boardPiece, canvas)
    this.initServer()
  }
  async fetch(evt : IFlyWebFetchEvent, url : string) {
    const response = await fetch(this.BASE_URL + url)
    const contentType = response.headers.get('Content-Type')
    const blob = await response.blob()
    const headers = { 'Content-Type': contentType }
    // TODO add no cache header please
    console.log('Response is: ', url)
    evt.respondWith(new Promise<Response>(r => r(new Response(blob, { headers }))))
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
        case '/dist/game.js':
          this.fetch(evt, '/dist/game-client.js')
          break;
        default: {
          this.fetch(evt, url)
        }
      }
    }
  }
}
