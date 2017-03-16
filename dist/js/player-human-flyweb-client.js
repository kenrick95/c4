"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var player_human_1 = require("./player-human");
var PlayerHumanFlywebClient = (function (_super) {
    __extends(PlayerHumanFlywebClient, _super);
    function PlayerHumanFlywebClient(boardPiece, canvas) {
        return _super.call(this, boardPiece, canvas) || this;
    }
    return PlayerHumanFlywebClient;
}(player_human_1.PlayerHuman));
exports.PlayerHumanFlywebClient = PlayerHumanFlywebClient;

//# sourceMappingURL=player-human-flyweb-client.js.map
