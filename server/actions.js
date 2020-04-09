const uuidV4 = require('uuid').v4
const ACTION_TYPE = {
  NEW_PLAYER_CONNECTION: 'NEW_PLAYER_CONNECTION',
  NEW_MATCH: 'NEW_MATCH',
  CONNECT_MATCH: 'CONNECT_MATCH',
  HUNG_UP: 'HUNG_UP',
  MOVE: 'MOVE'
}
function newPlayerConnection() {
  return {
    type: ACTION_TYPE.NEW_PLAYER_CONNECTION,
    payload: {
      playerId: uuidV4()
    }
  }
}
function newMatch(playerId) {
  return {
    type: ACTION_TYPE.NEW_MATCH,
    payload: {
      playerId,
      matchId: uuidV4()
    }
  }
}
function connectMatch(playerId, matchId) {
  return {
    type: ACTION_TYPE.CONNECT_MATCH,
    payload: {
      playerId,
      matchId
    }
  }
}
function move(playerId, matchId, column) {
  return {
    type: ACTION_TYPE.MOVE,
    payload: {
      playerId,
      matchId,
      column
    }
  }
}
function hungUp(playerId) {
  return {
    type: ACTION_TYPE.HUNG_UP,
    payload: {
      playerId
    }
  }
}
module.exports = {
  ACTION_TYPE,
  newPlayerConnection,
  newMatch,
  connectMatch,
  move,
  hungUp
}
