import { State } from './types'
import { Action, ACTION_TYPE } from './actions'
import { MESSAGE_TYPE } from '@kenrick95/c4-core/game/game-online/shared'

const INITIAL_STATE: State = {
  matches: {},
  players: {}
}

// TODO: There shouldn't be this much logic in the reducer ...
export function reducer(state: State = INITIAL_STATE, action: Action): State {
  switch (action.type) {
    case ACTION_TYPE.NEW_PLAYER_CONNECTION: {
      // Add player to server, no game/match yet
      const { ws, playerId } = action.payload
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.NEW_PLAYER_CONNECTION_OK,
          payload: {
            playerId
          }
        })
      )
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            playerId: playerId,
            lastSeen: Date.now(),
            ws: ws,
            matchId: null
          }
        }
      }
    }
    case ACTION_TYPE.NEW_MATCH: {
      // Init board, but no game yet
      const { playerId, matchId } = action.payload
      const player = state.players[playerId]

      player.ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.NEW_MATCH_OK,
          payload: {
            playerId,
            matchId
          }
        })
      )

      return {
        ...state,
        matches: {
          ...state.matches,
          [matchId]: {
            matchId: matchId,
            players: [playerId, null]
            // gameState: {
            //   isGameWon: false,
            //   isMoveAllowed: false,
            //   currentPlayerId: playerId,
            //   map: [[]]
            // }
          }
        },
        players: {
          ...state.players,
          [playerId]: {
            ...player,
            matchId
          }
        }
      }
    }
    case ACTION_TYPE.CONNECT_MATCH: {
      // Start game
      const { matchId, playerId } = action.payload
      const { players } = state.matches[matchId]

      const player = state.players[playerId]
      player.ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.CONNECT_MATCH_OK,
          payload: {
            playerId,
            matchId
          }
        })
      )
      const otherPlayerId = players[0]
      for (const id of [playerId, otherPlayerId]) {
        if (!id) {
          continue
        }
        const player = state.players[id]
        player.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.GAME_READY,
            payload: {}
          })
        )
      }
      return {
        ...state,
        matches: {
          ...state.matches,
          [matchId]: {
            ...state.matches[matchId],
            players: [players[0], playerId]
          }
        },
        players: {
          ...state.players,
          [playerId]: {
            ...player,
            matchId
          }
        }
      }
    }
    case ACTION_TYPE.HUNG_UP: {
      // End game
      const { playerId } = action.payload
      const player = state.players[playerId]
      const matchId = player.matchId

      player.ws.close()
      const newState = { ...state }

      const match = matchId ? newState.matches[matchId] : null
      if (match) {
        match.players = match.players.map(p => {
          return p === playerId ? null : p
        })
      }

      delete newState.players[playerId]
      return newState
    }
    case ACTION_TYPE.MOVE: {
      // Move piece
      const { playerId, matchId, column } = action.payload

      const match = state.matches[matchId]
      const otherPlayerId = match.players.find(player => player !== playerId)
      console.log('MOVE', playerId, matchId, column, otherPlayerId)

      if (otherPlayerId) {
        const otherPlayer = state.players[otherPlayerId]
        otherPlayer.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MOVE_SHADOW,
            payload: {
              column
            }
          })
        )
      }

      return state
    }

    case ACTION_TYPE.RENEW_LAST_SEEN: {
      const { playerId } = action.payload
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            lastSeen: Date.now()
          }
        }
      }
    }
  }
  return state
}
