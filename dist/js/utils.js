"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("./board");
var Utils = (function () {
    function Utils() {
    }
    Utils.drawText = function (context, _a) {
        var _b = _a.message, message = _b === void 0 ? '' : _b, _c = _a.x, x = _c === void 0 ? 0 : _c, _d = _a.y, y = _d === void 0 ? 0 : _d, _e = _a.fillStyle, fillStyle = _e === void 0 ? '#111' : _e, _f = _a.font, font = _f === void 0 ? '12pt sans-serif' : _f, _g = _a.maxWidth, maxWidth = _g === void 0 ? Utils.BIG_POSITIVE_NUMBER : _g;
        context.save();
        context.font = font;
        context.fillStyle = fillStyle;
        context.fillText(message, x, y, maxWidth);
        context.restore();
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
        context.fillStyle = '#ddd';
        context.beginPath();
        var x, y;
        for (y = 0; y < board_1.Board.row; y++) {
            for (x = 0; x < board_1.Board.column; x++) {
                context.arc(75 * x + 100, 75 * y + 50, 25, 0, 2 * Math.PI);
                context.rect(75 * x + 150, 75 * y, -100, 100);
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
        for (var i = 0; i < board_1.Board.column; i++) {
            if (Utils.isCoordOnColumn(coord, 75 * i + 100, 25)) {
                return i;
            }
        }
        return -1;
    };
    Utils.getRandomColumnNumber = function () {
        return Math.floor(Math.random() * board_1.Board.column);
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
        if (clonedMap[0][column] !== board_1.BoardPiece.EMPTY || column < 0 || column >= board_1.Board.column) {
            return {
                success: false,
                map: clonedMap
            };
        }
        var isColumnEverFilled = false;
        var row = 0;
        for (var i = 0; i < board_1.Board.row - 1; i++) {
            if (clonedMap[i + 1][column] !== board_1.BoardPiece.EMPTY) {
                isColumnEverFilled = true;
                row = i;
                break;
            }
        }
        if (!isColumnEverFilled) {
            row = board_1.Board.row - 1;
        }
        clonedMap[row][column] = boardPiece;
        return {
            success: true,
            map: clonedMap
        };
    };
    return Utils;
}());
Utils.BIG_POSITIVE_NUMBER = Math.pow(10, 9) + 7;
Utils.BIG_NEGATIVE_NUMBER = -Utils.BIG_POSITIVE_NUMBER;
exports.Utils = Utils;

//# sourceMappingURL=utils.js.map
