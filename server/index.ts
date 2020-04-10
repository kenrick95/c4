import * as WebSocket from 'ws'
import * as process from 'process'
import { ACTION_TYPE, Action, newPlayerConnection } from './actions'
import { MatchId, PlayerId } from './types'

const port = parseInt(process.env.PORT || '') || 8080
const wss = new WebSocket.Server({ port: port })
console.log(`[server] Started listening on ws://localhost:${port}`)

type MatchState = {
  matchId: MatchId
  gameState: {
    isGameWon: boolean
    isMoveAllowed: boolean
    players: Array<PlayerId>
    currentPlayerId: PlayerId
    map: Array<Array<number>>
  }
}
type PlayerState = {
  playerId: PlayerId
  matchId: MatchId
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
    case ACTION_TYPE.NEW_MATCH: {
      return {
        ...state,
        matches: {
          ...state.matches,
          [action.payload.matchId]: {
            matchId: action.payload.matchId,
            gameState: {
              isGameWon: false,
              isMoveAllowed: false,
              players: [action.payload.playerId],
              currentPlayerId: action.payload.playerId,
              map: [[]]
            }
          }
        }
      }
    }
  }
  return state
}

/**
 * TODO: Parse message into "action"
 */
function getAction(message: string): Action {
  return newPlayerConnection()
}

wss.on('connection', (ws: WebSocket) => {
  // TODO: Implement ping-pong heartbeat to check if player is still alive
  // https://www.npmjs.com/package/ws#how-to-detect-and-close-broken-connections

  ws.on('message', (message: string) => {
    console.log('received: %s', message)

    // TODO: This can be async (out-of-loop) actually :thinking:
    STATE = reducer(STATE, getAction(message))
  })

  ws.on('close', () => {})

  ws.send('something')
})
