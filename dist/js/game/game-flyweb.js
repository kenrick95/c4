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
var game_base_1 = require("./game-base");
var player_1 = require("../player");
var board_1 = require("../board");
var utils_1 = require("../utils");
var GameFlyweb = (function (_super) {
    __extends(GameFlyweb, _super);
    function GameFlyweb(players, canvas, clientMode) {
        if (clientMode === void 0) { clientMode = false; }
        var _this = _super.call(this, players, canvas) || this;
        _this.BASE_URL = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        _this.browser = navigator;
        _this.isAcceptingPlayer = true;
        _this.clientMode = clientMode;
        if (clientMode) {
            _this.playerSlave = players[0];
            _this.playerMaster = players[1];
            _this.initClient();
        }
        else {
            _this.playerMaster = players[0];
            _this.playerSlave = players[1];
            _this.initServer();
        }
        return _this;
    }
    GameFlyweb.prototype.afterMove = function (action) {
        if ((this.clientMode && this.currentPlayerId === 1) || (!this.clientMode && this.currentPlayerId === 0)) {
            this.playerMaster.socket.send(JSON.stringify({
                type: 'move',
                data: {
                    column: action,
                    from: this.currentPlayerId === 0 ? 'server' : 'client'
                }
            }));
        }
    };
    GameFlyweb.prototype.initClient = function () {
        this.handleClientWs();
    };
    GameFlyweb.prototype.handleClientWs = function () {
        var _this = this;
        var socket = new WebSocket('ws://' + window.location.host + '/api/ws');
        this.playerMaster.socket = socket;
        socket.onopen = function (evt) {
            console.log('client socket.onopen()', evt);
        };
        socket.onclose = function (evt) {
            console.log('client socket.onclose()', evt);
        };
        socket.onerror = function (evt) {
            console.log('client socket.onerror()', evt);
            socket.close();
        };
        socket.onmessage = function (evt) { return __awaiter(_this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('client socket.onmessage()', evt);
                        message = JSON.parse(evt.data);
                        if (!message) {
                            return [2 /*return*/];
                        }
                        if (message.from === 'client') {
                            return [2 /*return*/];
                        }
                        if (!(message.type === 'start')) return [3 /*break*/, 1];
                        utils_1.Utils.showMessage('<h1>Welcome!</h1>Connection to Player 1 has been established. Game started!');
                        this.start();
                        return [3 /*break*/, 4];
                    case 1:
                        if (!(message.type === 'move')) return [3 /*break*/, 2];
                        this.playerSlave.doAction(message.data.column);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(message.type === 'reset')) return [3 /*break*/, 4];
                        this.reset();
                        return [4 /*yield*/, utils_1.Utils.animationFrame()];
                    case 3:
                        _a.sent();
                        this.start();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
    };
    GameFlyweb.prototype.fetch = function (evt, url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, contentType, blob, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.BASE_URL + url)];
                    case 1:
                        response = _a.sent();
                        contentType = response.headers.get('Content-Type');
                        return [4 /*yield*/, response.blob()];
                    case 2:
                        blob = _a.sent();
                        headers = {
                            'Content-Type': contentType,
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': 0
                        };
                        console.log('Response is: ', url);
                        evt.respondWith(new Promise(function (r) { return r(new Response(blob, { headers: headers })); }));
                        return [2 /*return*/];
                }
            });
        });
    };
    GameFlyweb.prototype.handleWsServer = function (evt) {
        var _this = this;
        var socket = evt.accept();
        this.playerMaster.socket = socket;
        socket.onopen = function (evt) {
            console.log('server socket.onopen()', evt, socket);
            if (_this.isAcceptingPlayer) {
                _this.isAcceptingPlayer = false;
                socket.send(JSON.stringify({
                    type: 'start',
                    data: {
                        accepted: _this.isAcceptingPlayer
                    }
                }));
                utils_1.Utils.showMessage('<h1>Welcome!</h1>Connection to Player 2 has been established. Game started!');
                _this.start();
            }
            else {
                socket.close();
            }
        };
        socket.onclose = function (evt) {
            console.log('server socket.onclose()', evt);
            _this.isAcceptingPlayer = true;
            _this.reset();
        };
        socket.onerror = function (evt) {
            console.log('server socket.onerror()', evt);
            _this.isAcceptingPlayer = true;
            socket.close();
        };
        socket.onmessage = function (evt) { return __awaiter(_this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('server socket.onmessage()', evt);
                        message = JSON.parse(evt.data);
                        if (!message) {
                            return [2 /*return*/];
                        }
                        if (message.from === 'server') {
                            return [2 /*return*/];
                        }
                        if (!(message.type === 'move')) return [3 /*break*/, 1];
                        this.playerSlave.doAction(message.data.column);
                        return [3 /*break*/, 3];
                    case 1:
                        if (!(message.type === 'reset')) return [3 /*break*/, 3];
                        this.reset();
                        return [4 /*yield*/, utils_1.Utils.animationFrame()];
                    case 2:
                        _a.sent();
                        this.start();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    };
    GameFlyweb.prototype.initServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var server;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('publishServer' in this.browser)) {
                            utils_1.Utils.showMessage("<h1>Attention!</h1>\n        FlyWeb requires Firefox Developer Edition or Nightly,\n        and enabling \"dom.flyweb.enabled\" flag at about:config");
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.browser.publishServer('c4 - Connect Four')];
                    case 1:
                        server = _a.sent();
                        server.onfetch = function (evt) { return __awaiter(_this, void 0, void 0, function () {
                            var urlParts, url, params, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        urlParts = evt.request.url.split('?');
                                        url = urlParts[0];
                                        params = new URLSearchParams(urlParts[1]);
                                        console.log('me Requested for url: ', url, params);
                                        _a = url;
                                        switch (_a) {
                                            case '/dist/app.js': return [3 /*break*/, 1];
                                        }
                                        return [3 /*break*/, 3];
                                    case 1: return [4 /*yield*/, this.fetch(evt, '/dist/app-flyweb-client.js')];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 3: return [4 /*yield*/, this.fetch(evt, url)];
                                    case 4:
                                        _b.sent();
                                        _b.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); };
                        server.onwebsocket = function (evt) {
                            var url = evt.request.url;
                            if (url === '/api/ws') {
                                _this.handleWsServer(evt);
                            }
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    return GameFlyweb;
}(game_base_1.GameBase));
function initGameFlyweb(_a) {
    var _this = this;
    var _b = _a.clientMode, clientMode = _b === void 0 ? false : _b;
    var canvas = document.querySelector('canvas');
    var players = null;
    if (clientMode) {
        players = [
            new player_1.PlayerFlywebSlave(board_1.BoardPiece.PLAYER_1, canvas),
            new player_1.PlayerFlywebMaster(board_1.BoardPiece.PLAYER_2, canvas)
        ];
    }
    else {
        players = [
            new player_1.PlayerFlywebMaster(board_1.BoardPiece.PLAYER_1, canvas),
            new player_1.PlayerFlywebSlave(board_1.BoardPiece.PLAYER_2, canvas)
        ];
    }
    var game = new GameFlyweb(players, canvas, clientMode);
    utils_1.Utils.showMessage('<h1>Welcome!</h1>Game will start after Player 2 has been connected.');
    canvas.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!game.isGameWon) return [3 /*break*/, 2];
                    game.reset();
                    if (game.playerMaster && game.playerMaster.socket) {
                        game.playerMaster.socket.send(JSON.stringify({
                            type: 'reset',
                            data: {
                                reset: true
                            }
                        }));
                    }
                    return [4 /*yield*/, utils_1.Utils.animationFrame()];
                case 1:
                    _a.sent();
                    game.start();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
}
exports.initGameFlyweb = initGameFlyweb;

//# sourceMappingURL=game-flyweb.js.map
