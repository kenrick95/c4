import { v4 as uuidV4 } from 'uuid'
import { PlayerId, MatchId, RenewLastSeenAction, AppThunk } from './types'
import * as WebSocket from 'ws'
import { BoardBase } from '@kenrick95/c4-core/board'
import {
  MESSAGE_TYPE,
  constructMessage
} from '@kenrick95/c4-core/game/game-online/shared'

export enum ACTION_TYPE {
  NEW_PLAYER_CONNECTION = 'NEW_PLAYER_CONNECTION',
  NEW_MATCH = 'NEW_MATCH',
  CONNECT_MATCH = 'CONNECT_MATCH',
  HUNG_UP = 'HUNG_UP',
  MOVE = 'MOVE',
  RENEW_LAST_SEEN = 'RENEW_LAST_SEEN'
}
export function newPlayerConnection(ws: WebSocket): AppThunk<PlayerId> {
  return dispatch => {
    const playerId = uuidV4()
    dispatch({
      type: ACTION_TYPE.NEW_PLAYER_CONNECTION,
      payload: {
        playerId,
        ws
      }
    })

    ws.send(
      constructMessage(MESSAGE_TYPE.NEW_PLAYER_CONNECTION_OK, {
        playerId
      })
    )

    return playerId
  }
}
export function newMatch(playerId: PlayerId): AppThunk<MatchId> {
  return (dispatch, getState) => {
    const matchId = uuidV4()

    dispatch({
      type: ACTION_TYPE.NEW_MATCH,
      payload: {
        playerId,
        matchId
      }
    })

    const state = getState()

    const player = state.players[playerId]

    player.ws.send(
      constructMessage(MESSAGE_TYPE.NEW_MATCH_OK, {
        playerId,
        matchId
      })
    )

    return matchId
  }
}
export function connectMatch(
  playerId: PlayerId,
  matchId: MatchId | null
): AppThunk {
  return (dispatch, getState) => {
    {
      const state = getState()
      const player = state.players[playerId]

      if (
        /**
         * No matchId
         */
        !matchId ||
        /**
         * No match
         */
        !state.matches[matchId] ||
        /**
         * No player1 in match
         */
        !state.matches[matchId].players[0] ||
        /**
         * Player2 already in match
         */
        state.matches[matchId].players[1]
      ) {
        player.ws.send(
          constructMessage(MESSAGE_TYPE.CONNECT_MATCH_FAIL, {
            playerId,
            matchId
          })
        )
        return
      }
    }

    dispatch({
      type: ACTION_TYPE.CONNECT_MATCH,
      payload: {
        playerId,
        matchId
      }
    })

    {
      // Reply to this player that it is connected to this match
      const state = getState()
      const player = state.players[playerId]

      player.ws.send(
        constructMessage(MESSAGE_TYPE.CONNECT_MATCH_OK, {
          playerId,
          matchId
        })
      )
    }

    {
      // Tell all players that game is ready
      const state = getState()
      const match = state.matches[matchId]
      const playerIds = match.players
      for (const pId of playerIds) {
        if (!pId) {
          continue
        }
        const player = state.players[pId]
        player.ws.send(constructMessage(MESSAGE_TYPE.GAME_READY))
      }
    }
  }
}
export function move(
  playerId: PlayerId,
  matchId: MatchId | null,
  column: number
): AppThunk {
  return (dispatch, getState) => {
    if (!matchId) {
      return
    }
    const state = getState()
    const match = state.matches[matchId]
    if (match && column >= 0 && column < BoardBase.COLUMNS) {
      const otherPlayerId = match.players.find(player => player !== playerId)
      console.log('MOVE', playerId, matchId, column, otherPlayerId)

      if (otherPlayerId) {
        const otherPlayer = state.players[otherPlayerId]
        otherPlayer.ws.send(
          constructMessage(MESSAGE_TYPE.MOVE_SHADOW, {
            column
          })
        )
      }

      dispatch({
        type: ACTION_TYPE.MOVE,
        payload: {
          playerId,
          matchId,
          column
        }
      })
    }
  }
}

export function hungUp(playerId: PlayerId): AppThunk {
  return (dispatch, getState) => {
    const state = getState()
    const player = state.players[playerId]

    dispatch({
      type: ACTION_TYPE.HUNG_UP,
      payload: {
        playerId
      }
    })

    player.ws.close()
  }
}

export function renewLastSeen(playerId: PlayerId): RenewLastSeenAction {
  return {
    type: ACTION_TYPE.RENEW_LAST_SEEN,
    payload: {
      playerId,
      lastSeen: Date.now()
    }
  }
}
