import * as WebSocket from 'ws'

export type PlayerId = string
export type MatchId = string
export type MatchState = {
  matchId: MatchId
  players: Array<PlayerId | null>
  // gameState: {
  //   // TODO: Do I really need game state in server? :thinking:
  //   isGameWon: boolean
  //   isMoveAllowed: boolean
  //   currentPlayerId: PlayerId
  //   map: Array<Array<number>>
  // }
}
export type PlayerState = {
  playerId: PlayerId
  /**
   * JS timestamp
   */
  lastSeen: number
  ws: WebSocket

  matchId: null | MatchId
}
export type State = {
  matches: {
    [matchId: string]: MatchState
  }
  players: {
    [playerId: string]: PlayerState
  }
}
