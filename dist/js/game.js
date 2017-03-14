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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("./board");
var player_human_1 = require("./player-human");
var player_ai_1 = require("./player-ai");
var utils_1 = require("./utils");
var Game = (function () {
    function Game() {
        var canvas = document.querySelector('canvas');
        this.board = new board_1.Board(canvas);
        this.players = [
            new player_human_1.PlayerHuman(board_1.BoardPiece.PLAYER_1, canvas),
            new player_ai_1.PlayerAi(board_1.BoardPiece.PLAYER_2, canvas)
        ];
        this.currentPlayerId = 0;
        this.reset();
    }
    Game.prototype.reset = function () {
        this.isMoveAllowed = false;
        this.isGameWon = false;
        this.board.reset();
        this.board.render();
        this.board.debug();
    };
    Game.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var winner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isMoveAllowed = true;
                        _a.label = 1;
                    case 1:
                        if (!!this.isGameWon) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.move()];
                    case 2:
                        _a.sent();
                        winner = this.board.getWinner();
                        if (winner !== board_1.BoardPiece.EMPTY) {
                            console.log('Game over: winner is player ', winner);
                            this.isGameWon = true;
                            this.isMoveAllowed = false;
                            this.board.announceWinner();
                            return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.move = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentPlayer, actionSuccesful, action;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isMoveAllowed) {
                            return [2 /*return*/];
                        }
                        currentPlayer = this.players[this.currentPlayerId];
                        actionSuccesful = false;
                        _a.label = 1;
                    case 1:
                        if (!!actionSuccesful) return [3 /*break*/, 4];
                        return [4 /*yield*/, currentPlayer.getAction(this.board)];
                    case 2:
                        action = _a.sent();
                        this.isMoveAllowed = false;
                        return [4 /*yield*/, this.board.applyPlayerAction(currentPlayer, action)];
                    case 3:
                        actionSuccesful = _a.sent();
                        this.isMoveAllowed = true;
                        if (!actionSuccesful) {
                            console.log('Move not allowed! Try again.');
                        }
                        return [3 /*break*/, 1];
                    case 4:
                        this.currentPlayerId = this.getNextPlayer();
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.getNextPlayer = function () {
        return (this.currentPlayerId === 0) ? 1 : 0;
    };
    return Game;
}());
exports.Game = Game;
document.addEventListener('DOMContentLoaded', function () {
    var game = new Game();
    game.start();
    document.querySelector('canvas').addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!game.isGameWon) return [3 /*break*/, 2];
                    game.reset();
                    return [4 /*yield*/, utils_1.Utils.animationFrame()];
                case 1:
                    _a.sent();
                    game.start();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
});

//# sourceMappingURL=game.js.map
