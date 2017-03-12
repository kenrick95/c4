"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = (function () {
    function Utils() {
    }
    Utils.drawCircle = function (context, _a) {
        var _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c, _d = _a.r, r = _d === void 0 ? 0 : _d, _e = _a.fill, fill = _e === void 0 ? '' : _e, _f = _a.stroke, stroke = _f === void 0 ? '' : _f;
        context.save();
        context.fillStyle = fill;
        context.strokeStyle = stroke;
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI, false);
        context.fill();
        context.restore();
    };
    Utils.drawMask = function (board) {
        var context = board.context;
        context.save();
        context.fillStyle = "#ddd";
        context.beginPath();
        var x, y;
        for (y = 0; y < board.row; y++) {
            for (x = 0; x < board.column; x++) {
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
    Utils.isCoordOnColumn = function (coord, x, radius) {
        return ((coord.x - x) * (coord.x - x) <= radius * radius);
    };
    return Utils;
}());
exports.Utils = Utils;

//# sourceMappingURL=utils.js.map
