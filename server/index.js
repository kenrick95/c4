port = process.env.PORT || 8080
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: port })
const action = require('./actions.js')
const { ACTION_TYPE } = action

const INITIAL_STATE = {
  matches: {},
  players: {}
}
let STATE = {
  ...INITIAL_STATE
}
function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPE.NEW_MATCH: {
      return {
        ...state,
        matches: {
          ...state.matches,
          [action.payload.matchId]: {
            matchId: action.payload.matchId,
            gameState: {} // TODO: I need to import things from src. -__- Basically tracks a game <players , currentPlayerId , isMoveAllowed,  isGameWon>
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
function getAction(message) {}

wss.on('connection', ws => {
  // TODO: Implement ping-pong heartbeat to check if player is still alive
  // https://www.npmjs.com/package/ws#how-to-detect-and-close-broken-connections

  ws.on('message', message => {
    console.log('received: %s', message)

    // TODO: This can be async (out-of-loop) actually :thinking:
    STATE = reducer(STATE, getAction(message))
  })

  ws.on('close', () => {})

  ws.send('something')
})
