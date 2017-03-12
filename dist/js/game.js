"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("./board");
var player_human_1 = require("./player-human");
var player_ai_1 = require("./player-ai");
var Game = (function () {
    function Game() {
        this.board = new board_1.Board(document.querySelector('canvas'));
        this.players = [new player_human_1.PlayerHuman(board_1.BoardPiece.PLAYER_1), new player_ai_1.PlayerAi(board_1.BoardPiece.PLAYER_2)];
        this.currentPlayerId = 0;
        this.isMoveAllowed = false;
    }
    Game.prototype.start = function () {
        this.isMoveAllowed = true;
    };
    Game.prototype.move = function () {
        if (!this.isMoveAllowed) {
            return;
        }
        var currentPlayer = this.players[this.currentPlayerId];
        var actionSuccesful = false;
        while (!actionSuccesful) {
            var action = currentPlayer.getAction(this.board);
            actionSuccesful = this.board.applyPlayerAction(currentPlayer, action);
        }
        this.currentPlayerId = this.getNextPlayer();
    };
    Game.prototype.getNextPlayer = function () {
        return (this.currentPlayerId === 0) ? 1 : 0;
    };
    return Game;
}());
exports.Game = Game;

//# sourceMappingURL=game.js.map
