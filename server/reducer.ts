import { State } from './types'
import { Action, ACTION_TYPE } from './actions'
import { MESSAGE_TYPE } from '@kenrick95/c4-core/game/game-online/shared'

export function reducer(state: State, action: Action): State {
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
            ws: ws
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
      // TODO: Update PlayerState

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
      // TODO: Update player state

      return {
        ...state,
        matches: {
          ...state.matches,
          [matchId]: {
            ...state.matches[matchId],
            players: [players[0], playerId]
          }
        }
      }
    }
    case ACTION_TYPE.HUNG_UP: {
      // End game
      const { playerId } = action.payload
      state.players[playerId].ws.close()
      const newState = { ...state }
      delete newState.players[playerId]
      // TODO: Find match where player is in and notify the other player?

      return newState
    }
    case ACTION_TYPE.MOVE: {
      // Move piece
      const { playerId, matchId, column } = action.payload
      // TODO: Validate column...

      const match = state.matches[matchId]
      const otherPlayerId = match.players.find(player => player !== playerId)
      console.log('MOVE ', playerId, matchId, column)
      console.log('MOVE otherPlayerId', otherPlayerId)

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
