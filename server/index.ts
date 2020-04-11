import * as WebSocket from 'ws'
import * as process from 'process'

import { reducer } from './reducer'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'

import {
  newPlayerConnection,
  newMatch,
  connectMatch,
  hungUp,
  move,
  renewLastSeen
} from './actions'
import { MatchId, State, ActionTypes } from './types'

import { MESSAGE_TYPE } from '@kenrick95/c4-core/game/game-online/shared'
import { BoardBase } from '@kenrick95/c4-core/board'

const port = parseInt(process.env.PORT || '') || 8080
const wss = new WebSocket.Server({ port: port })
console.log(`[server] Started listening on ws://localhost:${port}`)

function configureStore() {
  const middleware = applyMiddleware(
    thunk as ThunkMiddleware<State, ActionTypes>
  )
  return createStore(reducer, middleware)
}
const store = configureStore()

function alivenessLoop() {
  const state = store.getState()
  const now = Date.now()
  for (const player of Object.values(state.players)) {
    if (now - player.lastSeen >= 60000) {
      player.ws.terminate()
    }

    player.ws.ping()
  }
}

wss.on('connection', (ws: WebSocket) => {
  const newPlayerConnectionAction = newPlayerConnection(ws)
  const playerId = newPlayerConnectionAction.payload.playerId
  let matchId: null | MatchId = null
  store.dispatch(newPlayerConnectionAction)

  ws.on('pong', () => {
    store.dispatch(renewLastSeen(playerId))
  })

  ws.on('message', (message: string) => {
    const parsedMessage = JSON.parse(message)
    console.log('[ws] receive: %s', parsedMessage)
    const state = store.getState()
    switch (parsedMessage.type) {
      case MESSAGE_TYPE.NEW_MATCH_REQUEST:
        {
          matchId = store.dispatch(newMatch(playerId))
        }
        break
      case MESSAGE_TYPE.MOVE_MAIN:
        {
          const dirtyColumn = parseInt(parsedMessage.payload.column)
          if (
            matchId &&
            state.matches[matchId] &&
            dirtyColumn >= 0 &&
            dirtyColumn < BoardBase.COLUMNS
          ) {
            store.dispatch(move(playerId, matchId, dirtyColumn))
          }
        }
        break
      case MESSAGE_TYPE.CONNECT_MATCH_REQUEST:
        {
          const dirtyMatchId = parsedMessage.payload.matchId
          if (state.matches[dirtyMatchId]) {
            matchId = dirtyMatchId
            store.dispatch(connectMatch(playerId, dirtyMatchId))
          }
        }
        break
      case MESSAGE_TYPE.HUNG_UP:
        {
          store.dispatch(hungUp(playerId))
        }
        break
    }
  })
  ws.on('close', () => {
    store.dispatch(hungUp(playerId))
  })
})
setInterval(alivenessLoop, 30000)
