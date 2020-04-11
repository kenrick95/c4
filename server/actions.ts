import { v4 as uuidV4 } from 'uuid'
import { PlayerId, MatchId, State } from './types'
import * as WebSocket from 'ws'

export type Action =
  | NewPlayerConnectionAction
  | NewMatchAction
  | HungUpAction
  | MoveAction
  | ConnectMatchAction
  | RenewLastSeenAction

type NewPlayerConnectionAction = {
  type: 'NEW_PLAYER_CONNECTION'
  payload: {
    playerId: PlayerId
    ws: WebSocket
  }
}
type NewMatchAction = {
  type: 'NEW_MATCH'
  payload: {
    playerId: PlayerId
    matchId: MatchId
  }
}
type HungUpAction = {
  type: 'HUNG_UP'
  payload: {
    playerId: PlayerId
  }
}
type MoveAction = {
  type: 'MOVE'
  payload: {
    playerId: PlayerId
    matchId: MatchId
    column: number
  }
}
type ConnectMatchAction = {
  type: 'CONNECT_MATCH'
  payload: {
    playerId: PlayerId
    matchId: MatchId
  }
}
type RenewLastSeenAction = {
  type: 'RENEW_LAST_SEEN'
  payload: {
    playerId: PlayerId
  }
}

export enum ACTION_TYPE {
  NEW_PLAYER_CONNECTION = 'NEW_PLAYER_CONNECTION',
  NEW_MATCH = 'NEW_MATCH',
  CONNECT_MATCH = 'CONNECT_MATCH',
  HUNG_UP = 'HUNG_UP',
  MOVE = 'MOVE',
  RENEW_LAST_SEEN = 'RENEW_LAST_SEEN'
}
export function newPlayerConnection(ws: WebSocket): NewPlayerConnectionAction {
  return {
    type: ACTION_TYPE.NEW_PLAYER_CONNECTION,
    payload: {
      playerId: uuidV4(),
      ws
    }
  }
}
export function newMatch(playerId: PlayerId): NewMatchAction {
  return {
    type: ACTION_TYPE.NEW_MATCH,
    payload: {
      playerId,
      matchId: uuidV4()
    }
  }
}
export function connectMatch(
  playerId: PlayerId,
  matchId: MatchId
): ConnectMatchAction {
  // TODO: Validate match
  // if (state.matches[dirtyMatchId]) {
  //   matchId = dirtyMatchId
  // }
  return {
    type: ACTION_TYPE.CONNECT_MATCH,
    payload: {
      playerId,
      matchId
    }
  }
}
export function move(
  playerId: PlayerId,
  matchId: MatchId,
  column: number
): MoveAction {
  // TODO Validate matchId, column
  
  // if (
  //   matchId &&
  //   state.matches[matchId] &&
  //   dirtyColumn >= 0 &&
  //   dirtyColumn < BoardBase.COLUMNS
  // ) {
  //   store.dispatch(move(playerId, matchId, dirtyColumn))
  // }
  return {
    type: ACTION_TYPE.MOVE,
    payload: {
      playerId,
      matchId,
      column
    }
  }
}
export function hungUp(playerId: PlayerId): HungUpAction {
  return {
    type: ACTION_TYPE.HUNG_UP,
    payload: {
      playerId
    }
  }
}
export function renewLastSeen(playerId: PlayerId): RenewLastSeenAction {
  return {
    type: ACTION_TYPE.RENEW_LAST_SEEN,
    payload: {
      playerId
    }
  }
}
