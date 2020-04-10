import { v4 as uuidV4 } from 'uuid'
import { PlayerId, MatchId } from './types'

export type Action =
  | NewPlayerConnectionAction
  | NewMatchAction

type NewPlayerConnectionAction = {
  type: 'NEW_PLAYER_CONNECTION'
  payload: {
    playerId: PlayerId
  }
}
type NewMatchAction = {
  type: 'NEW_MATCH'
  payload: {
    playerId: PlayerId
    matchId: MatchId
  }
}

export enum ACTION_TYPE {
  NEW_PLAYER_CONNECTION = 'NEW_PLAYER_CONNECTION',
  NEW_MATCH = 'NEW_MATCH',
  CONNECT_MATCH = 'CONNECT_MATCH',
  HUNG_UP = 'HUNG_UP',
  MOVE = 'MOVE'
}
export function newPlayerConnection(): NewPlayerConnectionAction {
  return {
    type: ACTION_TYPE.NEW_PLAYER_CONNECTION,
    payload: {
      playerId: uuidV4()
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
export function connectMatch(playerId: PlayerId, matchId: MatchId) {
  return {
    type: ACTION_TYPE.CONNECT_MATCH,
    payload: {
      playerId,
      matchId
    }
  }
}
export function move(playerId: PlayerId, matchId: MatchId, column: number) {
  return {
    type: ACTION_TYPE.MOVE,
    payload: {
      playerId,
      matchId,
      column
    }
  }
}
export function hungUp(playerId: PlayerId) {
  return {
    type: ACTION_TYPE.HUNG_UP,
    payload: {
      playerId
    }
  }
}
