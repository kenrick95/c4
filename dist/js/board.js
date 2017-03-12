"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var BoardPiece;
(function (BoardPiece) {
    BoardPiece[BoardPiece["EMPTY"] = 0] = "EMPTY";
    BoardPiece[BoardPiece["PLAYER_1"] = 1] = "PLAYER_1";
    BoardPiece[BoardPiece["PLAYER_2"] = 2] = "PLAYER_2";
    BoardPiece[BoardPiece["DRAW"] = 3] = "DRAW";
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
        return __awaiter(this, void 0, void 0, function () {
            var isColumnEverFilled, row, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.map[0][column] !== BoardPiece.EMPTY || column < 0 || column >= this.column) {
                            return [2 /*return*/, false];
                        }
                        isColumnEverFilled = false;
                        row = 0;
                        for (i = 0; i < this.row - 1; i++) {
                            if (this.map[i + 1][column] !== BoardPiece.EMPTY) {
                                isColumnEverFilled = true;
                                row = i;
                                break;
                            }
                        }
                        if (!isColumnEverFilled) {
                            row = this.row - 1;
                        }
                        return [4 /*yield*/, this.animateAction(row, column, player.boardPiece)];
                    case 1:
                        _a.sent();
                        this.map[row][column] = player.boardPiece;
                        this.debug();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Board.prototype.debug = function () {
        console.log(this.map.map(function (row) { return row.join(' '); }).join('\n'));
    };
    Board.prototype.getWinner = function () {
        var _this = this;
        var direction = [
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [1, -1],
            [1, 0],
            [1, 1]
        ];
        var isWinningSequence = function (i, j, playerPiece, dir, count) {
            if (count >= 4) {
                return true;
            }
            if (i < 0 || j < 0 || i >= _this.row || j >= _this.column || _this.map[i][j] !== playerPiece) {
                return false;
            }
            return isWinningSequence(i + dir[0], j + dir[1], playerPiece, dir, count + 1);
        };
        var countEmpty = 0;
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.column; j++) {
                var playerPiece = this.map[i][j];
                if (playerPiece !== BoardPiece.EMPTY) {
                    for (var k = 0; k < direction.length; k++) {
                        var isWon = isWinningSequence(i + direction[k][0], j + direction[k][1], playerPiece, direction[k], 1);
                        if (isWon) {
                            return playerPiece;
                        }
                    }
                }
                else {
                    countEmpty++;
                }
            }
        }
        if (countEmpty === 0) {
            return BoardPiece.DRAW;
        }
        return BoardPiece.EMPTY;
    };
    Board.prototype.getPlayerColor = function (boardPiece) {
        switch (boardPiece) {
            case BoardPiece.PLAYER_1: return '#ff4136';
            case BoardPiece.PLAYER_2: return '#0074d9';
            default: return 'transparent';
        }
    };
    Board.prototype.animateAction = function (newRow, column, boardPiece) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var fillStyle, currentY, doAnimation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fillStyle = this.getPlayerColor(boardPiece);
                        currentY = 0;
                        doAnimation = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                utils_1.Utils.clearCanvas(this);
                                utils_1.Utils.drawCircle(this.context, {
                                    x: 75 * column + 100,
                                    y: currentY + 50,
                                    r: 25,
                                    fill: fillStyle,
                                    stroke: 'black'
                                });
                                this.render();
                                currentY += 25;
                                return [2 /*return*/];
                            });
                        }); };
                        _a.label = 1;
                    case 1:
                        if (!(newRow * 75 >= currentY)) return [3 /*break*/, 3];
                        return [4 /*yield*/, utils_1.Utils.animationFrame()];
                    case 2:
                        _a.sent();
                        doAnimation();
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    Board.prototype.render = function () {
        utils_1.Utils.drawMask(this);
        var x, y;
        for (y = 0; y < this.row; y++) {
            for (x = 0; x < this.column; x++) {
                utils_1.Utils.drawCircle(this.context, {
                    x: 75 * x + 100,
                    y: 75 * y + 50,
                    r: 25,
                    fill: this.getPlayerColor(this.map[y][x]),
                    stroke: 'black'
                });
            }
        }
    };
    return Board;
}());
exports.Board = Board;

//# sourceMappingURL=board.js.map
