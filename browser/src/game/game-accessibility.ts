import { BoardBase, BoardPiece, type Player } from '@kenrick95/c4'

const liveRegion = document.querySelector('.section-message')
const boardStateBody = document.querySelector('.board-state-body')

const boardPieceLabel = {
  [BoardPiece.EMPTY]: 'Empty',
  [BoardPiece.PLAYER_1]: 'Player 1',
  [BoardPiece.PLAYER_2]: 'Player 2',
  [BoardPiece.DRAW]: 'Draw',
}

export function announce(message: string): void {
  if (liveRegion) {
    liveRegion.textContent = message
  }
}

export function renderBoardState(board: BoardBase, players: Array<Player>): void {
  if (!boardStateBody) {
    return
  }

  const labels = new Map(players.map((player) => [player.boardPiece, player.label]))
  const rows = board.map.map((row, rowIndex) => {
    const tableRow = document.createElement('tr')
    const rowHeader = document.createElement('th')
    rowHeader.scope = 'row'
    rowHeader.textContent = `Row ${rowIndex + 1}`
    tableRow.append(rowHeader)
    for (const boardPiece of row) {
      const cell = document.createElement('td')
      const label = labels.get(boardPiece)
      cell.textContent = label
        ? `${boardPieceLabel[boardPiece]}: ${label}`
        : boardPieceLabel[boardPiece]
      tableRow.append(cell)
    }
    return tableRow
  })
  boardStateBody.replaceChildren(...rows)
}

export function getMoveRow(board: BoardBase, column: number): number | undefined {
  for (let row = 0; row < BoardBase.ROWS; row++) {
    if (board.map[row][column] !== BoardPiece.EMPTY) {
      return row + 1
    }
  }
  return undefined
}
