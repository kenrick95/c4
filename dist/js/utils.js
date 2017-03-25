"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("./board");
var Utils = (function () {
    function Utils() {
    }
    Utils.showMessage = function (message) {
        if (message === void 0) { message = ''; }
        var messageDOM = document.querySelector('.message');
        messageDOM.classList.remove('hidden');
        var messageContentDOM = document.querySelector('.message-body-content');
        messageContentDOM.innerHTML = message;
        var messageDismissDOM = document.querySelector('.message-body-dismiss');
        var dismissHandler = function () {
            messageDOM.classList.add('invisible');
            messageDOM.addEventListener('transitionend', function () {
                messageDOM.classList.add('hidden');
                messageDOM.classList.remove('invisible');
            });
            messageDismissDOM.removeEventListener('click', dismissHandler);
        };
        messageDismissDOM.addEventListener('click', dismissHandler);
    };
    Utils.drawCircle = function (context, _a) {
        var _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c, _d = _a.r, r = _d === void 0 ? 0 : _d, _e = _a.fillStyle, fillStyle = _e === void 0 ? '' : _e, _f = _a.strokeStyle, strokeStyle = _f === void 0 ? '' : _f;
        context.save();
        context.fillStyle = fillStyle;
        context.strokeStyle = strokeStyle;
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI, false);
        context.fill();
        context.restore();
    };
    Utils.drawMask = function (board) {
        var context = board.context;
        context.save();
        context.fillStyle = board_1.Board.MASK_COLOR;
        context.beginPath();
        var doubleRadius = 2 * board_1.Board.PIECE_RADIUS;
        var tripleRadius = 3 * board_1.Board.PIECE_RADIUS;
        for (var y = 0; y < board_1.Board.ROWS; y++) {
            for (var x = 0; x < board_1.Board.COLUMNS; x++) {
                context.arc(tripleRadius * x + board_1.Board.MASK_X_BEGIN + doubleRadius, tripleRadius * y + board_1.Board.MASK_Y_BEGIN + doubleRadius, board_1.Board.PIECE_RADIUS, 0, 2 * Math.PI);
                context.rect(tripleRadius * x + board_1.Board.MASK_X_BEGIN + 2 * doubleRadius, tripleRadius * y + board_1.Board.MASK_Y_BEGIN, -2 * doubleRadius, 2 * doubleRadius);
            }
        }
        context.fill();
        context.restore();
    };
    Utils.clearCanvas = function (board) {
        board.context.clearRect(0, 0, board.canvas.width, board.canvas.height);
    };
    Utils.isCoordOnColumn = function (coord, columnXBegin, radius) {
        return ((coord.x - columnXBegin) * (coord.x - columnXBegin) <= radius * radius);
    };
    Utils.getColumnFromCoord = function (coord) {
        for (var i = 0; i < board_1.Board.COLUMNS; i++) {
            if (Utils.isCoordOnColumn(coord, 3 * board_1.Board.PIECE_RADIUS * i + board_1.Board.MASK_X_BEGIN + 2 * board_1.Board.PIECE_RADIUS, board_1.Board.PIECE_RADIUS)) {
                return i;
            }
        }
        return -1;
    };
    Utils.getRandomColumnNumber = function () {
        return Math.floor(Math.random() * board_1.Board.COLUMNS);
    };
    Utils.choose = function (choice) {
        return choice[Math.floor(Math.random() * choice.length)];
    };
    Utils.animationFrame = function () {
        var resolve = null;
        var promise = new Promise(function (r) { return resolve = r; });
        window.requestAnimationFrame(resolve);
        return promise;
    };
    Utils.clone = function (array) {
        var arr = [];
        for (var i = 0; i < array.length; i++) {
            arr[i] = array[i].slice();
        }
        return arr;
    };
    Utils.getMockPlayerAction = function (map, boardPiece, column) {
        var clonedMap = Utils.clone(map);
        if (clonedMap[0][column] !== board_1.BoardPiece.EMPTY || column < 0 || column >= board_1.Board.COLUMNS) {
            return {
                success: false,
                map: clonedMap
            };
        }
        var isColumnEverFilled = false;
        var row = 0;
        for (var i = 0; i < board_1.Board.ROWS - 1; i++) {
            if (clonedMap[i + 1][column] !== board_1.BoardPiece.EMPTY) {
                isColumnEverFilled = true;
                row = i;
                break;
            }
        }
        if (!isColumnEverFilled) {
            row = board_1.Board.ROWS - 1;
        }
        clonedMap[row][column] = boardPiece;
        return {
            success: true,
            map: clonedMap
        };
    };
    Utils.onresize = function () {
        var callbacks = [], running = false;
        function resize() {
            if (!running) {
                running = true;
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(runCallbacks);
                }
                else {
                    setTimeout(runCallbacks, 66);
                }
            }
        }
        function runCallbacks() {
            callbacks.forEach(function (callback) {
                callback();
            });
            running = false;
        }
        function addCallback(callback) {
            if (callback) {
                callbacks.push(callback);
            }
        }
        return {
            add: function (callback) {
                if (!callbacks.length) {
                    window.addEventListener('resize', resize);
                }
                addCallback(callback);
            }
        };
    };
    return Utils;
}());
Utils.BIG_POSITIVE_NUMBER = Math.pow(10, 9) + 7;
Utils.BIG_NEGATIVE_NUMBER = -Utils.BIG_POSITIVE_NUMBER;
exports.Utils = Utils;

//# sourceMappingURL=utils.js.map
