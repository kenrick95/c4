"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var BoardPiece;
(function (BoardPiece) {
    BoardPiece[BoardPiece["EMPTY"] = 0] = "EMPTY";
    BoardPiece[BoardPiece["PLAYER_1"] = 1] = "PLAYER_1";
    BoardPiece[BoardPiece["PLAYER_2"] = 2] = "PLAYER_2";
})(BoardPiece = exports.BoardPiece || (exports.BoardPiece = {}));
var Board = (function () {
    function Board(canvas) {
        this.row = 6;
        this.column = 7;
        this.map = [];
        for (var i = 0; i < this.row; i++) {
            this.map.push([]);
            for (var j = 0; j < this.column; j++) {
                this.map[i].push(BoardPiece.EMPTY);
            }
        }
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    }
    Board.prototype.applyPlayerAction = function (player, column) {
        if (this.map[0][column] !== BoardPiece.EMPTY || column < 0 || column >= this.column) {
            return false;
        }
        var isColumnEverFilled = false;
        var row = 0;
        for (var i = 0; i < this.row; i++) {
            if (this.map[i + 1][column] !== BoardPiece.EMPTY) {
                isColumnEverFilled = true;
                row = i;
                break;
            }
        }
        if (!isColumnEverFilled) {
            row = this.row - 1;
        }
        this.map[row][column] = player.boardPiece;
        return true;
    };
    Board.prototype.getPlayerColor = function (boardPiece) {
        switch (boardPiece) {
            case BoardPiece.PLAYER_1: return "#ff4136";
            case BoardPiece.PLAYER_2: return "#0074d9";
            default: return "transparent";
        }
    };
    Board.prototype.render = function () {
        var x, y;
        for (y = 0; y < this.row; y++) {
            for (x = 0; x < this.column; x++) {
                utils_1.Utils.drawCircle(this.context, {
                    x: 75 * x + 100,
                    y: 75 * y + 50,
                    r: 25,
                    fill: this.getPlayerColor(this.map[y][x]),
                    stroke: "black"
                });
            }
        }
    };
    return Board;
}());
exports.Board = Board;

//# sourceMappingURL=board.js.map
