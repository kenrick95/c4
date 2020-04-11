import * as WebSocket from 'ws'
import * as process from 'process'
import {
  Action,
  newPlayerConnection,
  newMatch,
  connectMatch,
  hungUp,
  move,
  renewLastSeen
} from './actions'
import { MatchId, State } from './types'
import { IncomingMessage } from 'http'
import { MESSAGE_TYPE } from '@kenrick95/c4-core/game/game-online/shared'
import { BoardBase } from '@kenrick95/c4-core/board'
import { reducer } from './reducer'

const port = parseInt(process.env.PORT || '') || 8080
const wss = new WebSocket.Server({ port: port })
console.log(`[server] Started listening on ws://localhost:${port}`)

const INITIAL_STATE: State = {
  matches: {},
  players: {}
}
let STATE: State = {
  ...INITIAL_STATE
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
function alivenessLoop() {
  const now = Date.now()
  for (const player of Object.values(STATE.players)) {
    if (now - player.lastSeen >= 60000) {
      player.ws.terminate()
    }

    player.ws.ping()
  }
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const newPlayerConnectionAction = newPlayerConnection(ws)
  const playerId = newPlayerConnectionAction.payload.playerId
  let matchId: null | MatchId = null
  dispatch(newPlayerConnectionAction)

  ws.on('pong', () => {
    dispatch(renewLastSeen(playerId))
  })

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
  ws.on('close', () => {
    dispatch(hungUp(playerId))
  })
})
setInterval(centralLoop, 100)
setInterval(alivenessLoop, 30000)
