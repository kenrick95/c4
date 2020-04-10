import * as WebSocket from 'ws'
import * as process from 'process'
import {
  ACTION_TYPE,
  Action,
  newPlayerConnection,
  newMatch,
  connectMatch,
  hungUp,
  move
} from './actions'
import { MatchId, PlayerId } from './types'
import { IncomingMessage } from 'http'
import { MESSAGE_TYPE } from '@kenrick95/c4-core/game/game-online/shared'
import { BoardBase } from '@kenrick95/c4-core/board'

const port = parseInt(process.env.PORT || '') || 8080
const wss = new WebSocket.Server({ port: port })
console.log(`[server] Started listening on ws://localhost:${port}`)

type MatchState = {
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
type PlayerState = {
  playerId: PlayerId
  ws: WebSocket
}
type State = {
  matches: {
    [matchId: string]: MatchState
  }
  players: {
    [playerId: string]: PlayerState
  }
}
const INITIAL_STATE: State = {
  matches: {},
  players: {}
}
let STATE: State = {
  ...INITIAL_STATE
}
function reducer(state: State, action: Action): State {
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
  }
  return state
}

const actionQueue: Action[] = []
function dispatch(action: Action) {
  console.log('action', action)
  actionQueue.push(action)
}
function centralLoop() {
  for (const action of actionQueue) {
    STATE = reducer(STATE, action)
  }
  if (actionQueue.length >= 1) {
    console.log('STATE', STATE)
  }
  actionQueue.length = 0
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const newPlayerConnectionAction = newPlayerConnection(ws)
  const playerId = newPlayerConnectionAction.payload.playerId
  let matchId: null | MatchId = null
  dispatch(newPlayerConnectionAction)

  ws.on('message', (message: string) => {
    const parsedMessage = JSON.parse(message)
    console.log('[ws] receive: %s', parsedMessage)
    switch (parsedMessage.type) {
      case MESSAGE_TYPE.NEW_MATCH_REQUEST:
        {
          const newMatchAction = newMatch(playerId)
          matchId = newMatchAction.payload.matchId
          dispatch(newMatchAction)
        }
        break
      case MESSAGE_TYPE.MOVE_MAIN:
        {
          const dirtyColumn = parseInt(parsedMessage.payload.column)
          console.log('MOVE_MAIN', playerId, matchId, dirtyColumn)
          if (
            matchId &&
            STATE.matches[matchId] &&
            dirtyColumn >= 0 &&
            dirtyColumn < BoardBase.COLUMNS
          ) {
            dispatch(move(playerId, matchId, dirtyColumn))
          }
        }
        break
      case MESSAGE_TYPE.CONNECT_MATCH_REQUEST:
        {
          const dirtyMatchId = parsedMessage.payload.matchId
          if (STATE.matches[dirtyMatchId]) {
            matchId = dirtyMatchId
            dispatch(connectMatch(playerId, dirtyMatchId))
          }
        }
        break
      case MESSAGE_TYPE.HUNG_UP:
        {
          dispatch(hungUp(playerId))
        }
        break
    }
  })
  ws.on('close', () => {})
})
const intervalId = setInterval(centralLoop, 100)
