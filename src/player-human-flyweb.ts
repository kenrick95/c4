/**
 * EXPERIMENTAL
 * Based on flyweb example "photo-wall"
 * 2-player not achievable yet, FlyWeb clients currently could play locally with AI :P
 */
import { Player } from './player';
import { PlayerHuman } from './player-human'
import { Board, BoardPiece } from './board';
import { Utils } from './utils';

export class PlayerHumanFlyweb extends PlayerHuman {
  readonly BASE_URL = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

  constructor(boardPiece: BoardPiece, canvas: HTMLCanvasElement) {
    super(boardPiece, canvas)
    this.initServer()
  }
  async initServer() {
    if (!('publishServer' in navigator)) {
      window.alert('FlyWeb requires Firefox Developer Edition ')
      return false
    }
    // TODO: Fix TypeScript not recognizing navigator.publishServer and the Event it resolved
    const server = await navigator.publishServer('c4 - Connect Four')
    server.onfetch = async (evt) => {
      var urlParts = evt.request.url.split('?');

      var url = urlParts[0];
      var params = new URLSearchParams(urlParts[1]);
      console.log('Requested for url: ', url, params)
      
      switch (url) {
        default:
          const response = await fetch(this.BASE_URL + url)
          const contentType = response.headers.get('Content-Type')
          console.log('my response: ', response)
          evt.respondWith(new Response(await response.blob(), {
            headers: {
              'Content-Type': contentType
            }
          }))
        
      }
    }
  }
}
