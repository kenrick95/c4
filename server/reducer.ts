import { State, ActionTypes } from './types'
import { ACTION_TYPE } from './actions'

const INITIAL_STATE: State = {
  matches: {},
  players: {}
}

export function reducer(
  state: State = INITIAL_STATE,
  action: ActionTypes
): State {
  console.log('[reducer] Action: ', action.type);
  switch (action.type) {
    case ACTION_TYPE.NEW_PLAYER_CONNECTION: {
      // Add player to server, no game/match yet
      const { ws, playerId } = action.payload
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
      const { playerId } = action.payload
      const matchId = state.players[playerId].matchId

      const newState = { ...state }

      const match = matchId ? newState.matches[matchId] : null
      if (match) {
        match.players = match.players.map(p => {
          return p === playerId ? null : p
        })
      }
      // TODO: Is it confusing? If match in progress, P2 disconnected (HUNG_UP), then connected again, which will make "GAME_READY" to be sent to P1 again

      delete newState.players[playerId]
      return newState
    }
    case ACTION_TYPE.MOVE: {
      // TODO: If game state is tracked server-side, update it here
      return state
    }

    case ACTION_TYPE.RENEW_LAST_SEEN: {
      const { playerId, lastSeen } = action.payload
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            lastSeen
          }
        }
      }
    }
  }
  return state
}
