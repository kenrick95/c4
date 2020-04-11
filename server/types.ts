import * as WebSocket from 'ws'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'

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

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  State,
  unknown,
  Action<string>
>

export type ActionTypes =
  | NewPlayerConnectionAction
  | NewMatchAction
  | HungUpAction
  | MoveAction
  | ConnectMatchAction
  | RenewLastSeenAction

export type NewPlayerConnectionAction = {
  type: 'NEW_PLAYER_CONNECTION'
  payload: {
    playerId: PlayerId
    ws: WebSocket
  }
}
export type NewMatchAction = {
  type: 'NEW_MATCH'
  payload: {
    playerId: PlayerId
    matchId: MatchId
  }
}
export type HungUpAction = {
  type: 'HUNG_UP'
  payload: {
    playerId: PlayerId
  }
}
export type MoveAction = {
  type: 'MOVE'
  payload: {
    playerId: PlayerId
    matchId: MatchId
    column: number
  }
}
export type ConnectMatchAction = {
  type: 'CONNECT_MATCH'
  payload: {
    playerId: PlayerId
    matchId: MatchId
  }
}
export type RenewLastSeenAction = {
  type: 'RENEW_LAST_SEEN'
  payload: {
    playerId: PlayerId
  }
}
