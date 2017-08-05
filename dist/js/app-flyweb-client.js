"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = require("./game");
document.addEventListener('DOMContentLoaded', function () {
    var modeDOM = document.querySelector('.mode');
    if (modeDOM) {
        modeDOM.classList.add('hidden');
    }
    Game.initGameFlyweb({ clientMode: true });
});

//# sourceMappingURL=app-flyweb-client.js.map
