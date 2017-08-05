"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("es6-promise/auto");
var Game = require("./game");
var board_1 = require("./board");
document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.querySelector('canvas');
    if (!canvas) {
        console.error('Canvas DOM is null');
        return;
    }
    var board = new board_1.Board(canvas);
    board.render();
    if (!('publishServer' in navigator)) {
        var flywebOptionInput = document.querySelector('.mode-chooser-input-flyweb');
        if (flywebOptionInput) {
            flywebOptionInput.setAttribute('disabled', 'disabled');
        }
    }
    var modeChooser = document.querySelector('.mode-chooser-submit');
    if (modeChooser) {
        modeChooser.addEventListener('click', function () {
            var modeDOM = document.querySelector('.mode');
            if (modeDOM) {
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
            }
        });
    }
});

//# sourceMappingURL=app.js.map
