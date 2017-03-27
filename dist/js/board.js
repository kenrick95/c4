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
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.getBoardScale();
        this.initConstants();
        this.reset();
        this.onresize();
    }
    Board.prototype.reset = function () {
        this.map = [];
        for (var i = 0; i < Board.ROWS; i++) {
            this.map.push([]);
            for (var j = 0; j < Board.COLUMNS; j++) {
                this.map[i].push(BoardPiece.EMPTY);
            }
        }
        this.winnerBoardPiece = BoardPiece.EMPTY;
        utils_1.Utils.clearCanvas(this);
    };
    Board.prototype.getBoardScale = function () {
        return (window.innerWidth < 640)
            ? Board.SCALE = 0.5
            : Board.SCALE = 1.0;
    };
    Board.prototype.initConstants = function () {
        Board.CANVAS_HEIGHT = Board.SCALE * 480;
        Board.CANVAS_WIDTH = Board.SCALE * 640;
        Board.PIECE_RADIUS = Board.SCALE * 25;
        Board.MASK_X_BEGIN = Math.max(0, Board.CANVAS_WIDTH - (3 * Board.COLUMNS + 1) * Board.PIECE_RADIUS) / 2;
        Board.MASK_Y_BEGIN = Math.max(0, Board.CANVAS_HEIGHT - (3 * Board.ROWS + 1) * Board.PIECE_RADIUS) / 2;
        Board.MESSAGE_WIDTH = Board.SCALE * 400;
        Board.MESSAGE_X_BEGIN = (Board.CANVAS_WIDTH - Board.MESSAGE_WIDTH) / 2;
        Board.MESSAGE_Y_BEGIN = Board.SCALE * 20;
        this.canvas.width = Board.CANVAS_WIDTH;
        this.canvas.height = Board.CANVAS_HEIGHT;
    };
    Board.prototype.onresize = function () {
        var _this = this;
        var prevBoardScale = Board.SCALE;
        utils_1.Utils.onresize().add(function () {
            _this.getBoardScale();
            if (prevBoardScale !== Board.SCALE) {
                prevBoardScale = Board.SCALE;
                _this.initConstants();
                utils_1.Utils.clearCanvas(_this);
                _this.render();
            }
        });
    };
    Board.prototype.applyPlayerAction = function (player, column) {
        return __awaiter(this, void 0, void 0, function () {
            var isColumnEverFilled, row, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.map[0][column] !== BoardPiece.EMPTY || column < 0 || column >= Board.COLUMNS) {
                            return [2 /*return*/, false];
                        }
                        isColumnEverFilled = false;
                        row = 0;
                        for (i = 0; i < Board.ROWS - 1; i++) {
                            if (this.map[i + 1][column] !== BoardPiece.EMPTY) {
                                isColumnEverFilled = true;
                                row = i;
                                break;
                            }
                        }
                        if (!isColumnEverFilled) {
                            row = Board.ROWS - 1;
                        }
                        return [4 /*yield*/, this.animateAction(row, column, player.boardPiece)];
                    case 1:
                        _a.sent();
                        this.map[row][column] = player.boardPiece;
                        this.debug();
                        return [4 /*yield*/, utils_1.Utils.animationFrame()];
                    case 2:
                        _a.sent();
                        this.render();
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
        if (this.winnerBoardPiece !== BoardPiece.EMPTY) {
            return this.winnerBoardPiece;
        }
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
            if (i < 0 || j < 0 || i >= Board.ROWS || j >= Board.COLUMNS || _this.map[i][j] !== playerPiece) {
                return false;
            }
            return isWinningSequence(i + dir[0], j + dir[1], playerPiece, dir, count + 1);
        };
        var countEmpty = 0;
        for (var i = 0; i < Board.ROWS; i++) {
            for (var j = 0; j < Board.COLUMNS; j++) {
                var playerPiece = this.map[i][j];
                if (playerPiece !== BoardPiece.EMPTY) {
                    for (var k = 0; k < direction.length; k++) {
                        var isWon = isWinningSequence(i + direction[k][0], j + direction[k][1], playerPiece, direction[k], 1);
                        if (isWon) {
                            return this.winnerBoardPiece = playerPiece;
                        }
                    }
                }
                else {
                    countEmpty++;
                }
            }
        }
        if (countEmpty === 0) {
            return this.winnerBoardPiece = BoardPiece.DRAW;
        }
        return BoardPiece.EMPTY;
    };
    Board.prototype.announceWinner = function () {
        if (this.winnerBoardPiece === BoardPiece.EMPTY) {
            return;
        }
        var message = '<h1>Thank you for playing.</h1>';
        if (this.winnerBoardPiece === BoardPiece.DRAW) {
            message += "It's a draw";
        }
        else {
            message += "Player " + this.winnerBoardPiece + " wins";
        }
        message += '.<br />After dismissing this message, click the board to reset game.';
        utils_1.Utils.showMessage(message);
    };
    Board.prototype.getPlayerColor = function (boardPiece) {
        switch (boardPiece) {
            case BoardPiece.PLAYER_1: return Board.PLAYER_1_COLOR;
            case BoardPiece.PLAYER_2: return Board.PLAYER_2_COLOR;
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
                                    x: 3 * Board.PIECE_RADIUS * column + Board.MASK_X_BEGIN + 2 * Board.PIECE_RADIUS,
                                    y: currentY + Board.MASK_Y_BEGIN + 2 * Board.PIECE_RADIUS,
                                    r: Board.PIECE_RADIUS,
                                    fillStyle: fillStyle,
                                    strokeStyle: Board.PIECE_STROKE_STYLE
                                });
                                this.render();
                                currentY += Board.PIECE_RADIUS;
                                return [2 /*return*/];
                            });
                        }); };
                        _a.label = 1;
                    case 1:
                        if (!(newRow * 3 * Board.PIECE_RADIUS >= currentY)) return [3 /*break*/, 3];
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
        for (var y = 0; y < Board.ROWS; y++) {
            for (var x = 0; x < Board.COLUMNS; x++) {
                utils_1.Utils.drawCircle(this.context, {
                    x: 3 * Board.PIECE_RADIUS * x + Board.MASK_X_BEGIN + 2 * Board.PIECE_RADIUS,
                    y: 3 * Board.PIECE_RADIUS * y + Board.MASK_Y_BEGIN + 2 * Board.PIECE_RADIUS,
                    r: Board.PIECE_RADIUS,
                    fillStyle: this.getPlayerColor(this.map[y][x]),
                    strokeStyle: Board.PIECE_STROKE_STYLE
                });
            }
        }
    };
    return Board;
}());
Board.ROWS = 6;
Board.COLUMNS = 7;
Board.PLAYER_1_COLOR = '#ef453b';
Board.PLAYER_2_COLOR = '#0059ff';
Board.PIECE_STROKE_STYLE = 'black';
Board.MASK_COLOR = '#d8d8d8';
exports.Board = Board;

//# sourceMappingURL=board.js.map
