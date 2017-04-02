"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = require("./game");
var board_1 = require("./board");
document.addEventListener('DOMContentLoaded', function () {
    var board = new board_1.Board(document.querySelector('canvas'));
    board.render();
    if (!('publishServer' in navigator)) {
        document.querySelector('.mode-chooser-input-flyweb').setAttribute('disabled', 'disabled');
    }
    document.querySelector('.mode-chooser-submit').addEventListener('click', function () {
        var modeDOM = document.querySelector('.mode');
        var modeInputDOMs = document.querySelectorAll('.mode-chooser-input');
        var chosenMode = null;
        for (var i = 0; i < modeInputDOMs.length; i++) {
            chosenMode = modeInputDOMs[i].checked ? modeInputDOMs[i].value : null;
            if (chosenMode) {
                break;
            }
        }
        if (!chosenMode) {
            chosenMode = 'offline-ai';
        }
        if (chosenMode === 'offline-human') {
            Game.initGameLocal2p();
        }
        else if (chosenMode === 'local-flyweb') {
            Game.initGameFlyweb({ clientMode: false });
        }
        else if (chosenMode === 'offline-ai') {
            Game.initGameLocalAi();
        }
        modeDOM.classList.add('invisible');
        modeDOM.addEventListener('transitionend', function () {
            modeDOM.classList.add('hidden');
        });
    });
});

//# sourceMappingURL=app.js.map
