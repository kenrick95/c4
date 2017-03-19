import { Player } from './player';
import { Board, BoardPiece } from '../board';
import { Utils } from '../utils';

export class PlayerAi extends Player {
  static readonly MAX_DEPTH = 4
  private ownBoardPieceValue: number;
  private enemyBoardPiece: BoardPiece;
  constructor(boardPiece: BoardPiece, canvas: HTMLCanvasElement) {
    super(boardPiece, canvas)
    this.ownBoardPieceValue = this.getBoardPieceValue(boardPiece)
    this.enemyBoardPiece = (boardPiece === BoardPiece.PLAYER_1) ? BoardPiece.PLAYER_2 : BoardPiece.PLAYER_1;
  }
  private getBoardPieceValue(boardPiece: BoardPiece): number {
    return (boardPiece === BoardPiece.EMPTY)
      ? 0
      : boardPiece === this.boardPiece
        ? 1
        : -1
  }
  private getStateValue(state: Array<Array<number>>): { winnerBoardPiece: BoardPiece, chain: number } {
    let winnerBoardPiece = BoardPiece.EMPTY;
    let chainValue = 0;
    for (let i = 0; i < Board.ROWS; i++) {
      for (let j = 0; j < Board.COLUMNS; j++) {
        let tempRight = 0, tempBottom = 0, tempBottomRight = 0, tempTopRight = 0;
        for (let k = 0; k <= 3; k++) {
          // from (i,j) to right
          if (j + k < Board.COLUMNS) {
            tempRight += this.getBoardPieceValue(state[i][j + k]);
          }

          // from (i,j) to bottom
          if (i + k < Board.ROWS) {
            tempBottom += this.getBoardPieceValue(state[i + k][j]);
          }

          // from (i,j) to bottom-right
          if (i + k < Board.ROWS && j + k < Board.COLUMNS) {
            tempBottomRight += this.getBoardPieceValue(state[i + k][j + k]);
          }

          // from (i,j) to top-right
          if (i - k >= 0 && j + k < 7) {
            tempTopRight += this.getBoardPieceValue(state[i - k][j + k]);
          }
        }
        chainValue += tempRight * tempRight * tempRight;
        chainValue += tempBottom * tempBottom * tempBottom;
        chainValue += tempBottomRight * tempBottomRight * tempBottomRight;
        chainValue += tempTopRight * tempTopRight * tempTopRight;

        if (Math.abs(tempRight) === 4) {
          winnerBoardPiece = tempRight > 0 ? this.boardPiece : this.enemyBoardPiece;
        } else if (Math.abs(tempBottom) === 4) {
          winnerBoardPiece = tempBottom > 0 ? this.boardPiece : this.enemyBoardPiece;
        } else if (Math.abs(tempBottomRight) === 4) {
          winnerBoardPiece = tempBottomRight > 0 ? this.boardPiece : this.enemyBoardPiece;
        } else if (Math.abs(tempTopRight) === 4) {
          winnerBoardPiece = tempTopRight > 0 ? this.boardPiece : this.enemyBoardPiece;
        }

      }
    }
    return {
      winnerBoardPiece: winnerBoardPiece,
      chain: chainValue
    }
  }

  /**
   * @return transformed value, so the AI could take a "lower hanging fruit",
   *          i.e. a reward in closer future worth more than the same reward in distant future
   * @param returnValue 
   * @param winnerBoardPiece 
   * @param depth 
   */
  private transformValues(returnValue: number, winnerBoardPiece: BoardPiece, depth: number): number {
    const isWon = winnerBoardPiece === this.boardPiece
    const isLost = winnerBoardPiece === this.enemyBoardPiece

    // value is slightly higher than BIG_NEGATIVE_NUMBER & lower than BIG_POSITIVE_NUMBER
    // so that minState(...) and maxState(...) could "catch"" this value and AI take this move
    // This is just my hypothesis, I haven't tested without it yet.
    // My point is that this AI implementation is basically a heuristic function :P
    if (isWon) {
      returnValue = Utils.BIG_POSITIVE_NUMBER - 100;
    } else if (isLost) {
      returnValue = Utils.BIG_NEGATIVE_NUMBER + 100;
    }
    returnValue -= depth * depth;
    return returnValue
  }
  private getMove(state: Array<Array<number>>, depth: number, alpha: number, beta: number): {
    value: number,
    move: number
  } {
    const stateValue = this.getStateValue(state)
    const isWon = stateValue.winnerBoardPiece === this.boardPiece
    const isLost = stateValue.winnerBoardPiece === this.enemyBoardPiece

    if (depth >= PlayerAi.MAX_DEPTH || isWon || isLost) {
      return {
        value: this.transformValues(stateValue.chain * this.ownBoardPieceValue, stateValue.winnerBoardPiece, depth),
        move: -1 // leaf node
      }
    }

    return (depth % 2 === 0)
      ? this.minState(state, depth + 1, alpha, beta) // next is enemy's turn
      : this.maxState(state, depth + 1, alpha, beta) // next is my turn
  }

  private maxState(state: Array<Array<number>>, depth: number, alpha: number, beta: number): {
    value: number,
    move: number
  } {
    let value = Utils.BIG_NEGATIVE_NUMBER;
    let moveQueue: Array<number> = [];
    for (let column = 0; column < Board.COLUMNS; column++) {
      const { success: actionSuccessful, map: nextState } = Utils.getMockPlayerAction(state, this.boardPiece, column);
      if (actionSuccessful) {
        const { value: nextValue, move: nextMove } = this.getMove(nextState, depth, alpha, beta);
        if (nextValue > value) {
          value = nextValue
          moveQueue = [column]
        } else if (nextValue === value) {
          moveQueue.push(column)
        }

        // alpha-beta pruning
        if (value > beta) {
          return {
            value: value,
            move: Utils.choose(moveQueue)
          };
        }
        alpha = Math.max(alpha, value);
      }
    }

    return {
      value: value,
      move: Utils.choose(moveQueue)
    }
  }
  private minState(state: Array<Array<number>>, depth: number, alpha: number, beta: number): {
    value: number,
    move: number
  } {
    let value = Utils.BIG_POSITIVE_NUMBER;
    let moveQueue: Array<number> = [];
    for (let column = 0; column < Board.COLUMNS; column++) {
      const { success: actionSuccessful, map: nextState } = Utils.getMockPlayerAction(state, this.enemyBoardPiece, column);
      if (actionSuccessful) {
        const { value: nextValue, move: nextMove } = this.getMove(nextState, depth, alpha, beta);
        if (nextValue < value) {
          value = nextValue
          moveQueue = [column]
        } else if (nextValue === value) {
          moveQueue.push(column)
        }

        // alpha-beta pruning
        if (value < alpha) {
          return {
            value: value,
            move: Utils.choose(moveQueue)
          };
        }
        beta = Math.min(beta, value);
      }
    }
    return {
      value: value,
      move: Utils.choose(moveQueue)
    }
  }

  async getAction(board: Board): Promise<number> {
    const state = Utils.clone(board.map)
    const action = this.maxState(state, 0, Utils.BIG_NEGATIVE_NUMBER, Utils.BIG_POSITIVE_NUMBER);
    console.log(`AI ${this.boardPiece} choose column ${action.move} with value of ${action.value}`)
    return action.move;
  }
}
