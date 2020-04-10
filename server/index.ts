import * as WebSocket from 'ws'
import * as process from 'process'
import { ACTION_TYPE, Action, newPlayerConnection } from './actions'
import { MatchId, PlayerId } from './types'
import { IncomingMessage } from 'http'

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
      return {
        ...state,
        players: {
          ...state.players,
          [action.payload.playerId]: {
            playerId: action.payload.playerId,
            ws: action.payload.ws
          }
        }
      }
    }
    case ACTION_TYPE.NEW_MATCH: {
      // Init board, but no game yet
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
    case ACTION_TYPE.CONNECT_MATCH: {
      // Start game
    }
    case ACTION_TYPE.HUNG_UP: {
      // End game
    }
    case ACTION_TYPE.MOVE: {
      // Move piece
    }
  }
  return state
}

const actionQueue: Action[] = []
function dispatch(action: Action) {
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
  dispatch(newPlayerConnectionAction)

  ws.on('message', (message: string) => {
    console.log('received: %s', message)
  })
  ws.on('close', () => {})
  ws.send('hellooo')
})
const intervalId = setInterval(centralLoop, 100)
