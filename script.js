/*jslint browser:true, plusplus:true, vars: true */
"use strict";
// http://stackoverflow.com/questions/13756482/create-copy-of-multi-dimensional-array-not-reference-javascript
Array.prototype.clone = function () {
    var arr = [], i;
    for (i = 0; i < this.length; i++) {
        arr[i] = this[i].slice();
    }
    return arr;
};
// Main Class of the Program
function Game() {
    var that = this;
    this.map = [];
    this.paused = false;
    this.won = false;
    this.rejectClick = false;
    this.move = 0;
    this.aiHistory = [];

    this.initOnceDone = false;
    /**
     * Only initalize once for these functions, can prevent race condition
     */
    this.initOnce = function () {
        if (this.initOnceDone) {
            return false;
        }

        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.addEventListener('click', function (e) {
            that.onclick(that.canvas, e);
        });
        this.context = this.canvas.getContext('2d');
        this.initOnceDone = true;
    };

    /**
    *   This function is called on initialization of the script.
    *   It sets up all variables to the appropriate values for the
    *   start of a connect 4 game.
    */
    this.init = function () {
        this.map = [];
        this.paused = false;
        this.won = false;
        this.rejectClick = false;
        this.move = 0;
        this.aiHistory = [];
        this.initOnce();

        var i, j;
        //  Map is a double array that represents all locations on the board.
        for (i = 0; i <= 6; i++) {
            this.map[i] = [];
            for (j = 0; j <= 7; j++) {
                this.map[i][j] = 0;
            }
        }
        this.clear();
        this.drawMask();
        this.print();
    };
    /**
    *	Returns a value based on
    *	Who's turn it is.
    */
    this.playerMove = function () {
        if (this.move % 2 === 0) {
            return 1;
        }
        return -1;
    };

    /**
    *   Helper function: printing board to the browser Console.
    */
    this.print = function () {
        var i, j, msg;
        msg = "\n";
        msg += "Move: " + this.move;
        msg += "\n";
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                msg += " " + this.map[i][j];
            }
            msg += "\n";
        }
        console.log(msg);
    };

    /**
    *   Helper function: printing the board state to the browser Console.
    */
    this.printState = function (state) {
        var i, j, msg = "\n";
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                msg += " " + state[i][j];
            }
            msg += "\n";
        }
        console.log(msg);
    };

    /**
    *   This function is for printing win state to the browser Console.
    *   It is also used for displaying to the user who won as text on
    *   the canvas.
    */
    this.win = function (player) {
        this.paused = true;
        this.won = true;
        this.rejectClick = false;
        var msg = null;
        if (player > 0) {
            msg = "Player 1 wins";
        } else if (player < 0) {
            msg = "Player 2 wins";
        } else {
            msg = "It's a draw";
        }
        msg += " - Click to reset";
        this.context.save();
        this.context.font = '14pt sans-serif';
        this.context.fillStyle = "#111";
        this.context.fillText(msg, 200, 20);
        this.context.restore();

        console.info(msg);
    };
    /**
    *   Returns a modified state map that reflects
    *   a piece being added to it.
    */
    this.fillMap = function (state, column, value) {
        // Copy current state of the board.
        var tempMap = state.clone();

        if (tempMap[0][column] !== 0 || column < 0 || column > 6) {
            // If the top piece is filled, return.
            return -1;
        }

        var done = false,
            row = 0,
            i;

        // For each row
        for (i = 0; i < 5; i++) {
            // If the row isn't empty
            if (tempMap[i + 1][column] !== 0) {	
                done = true;
                row = i;
                break;
            }
        }
        if (!done) {
            row = 5;
        }
        tempMap[row][column] = value;
        return tempMap;

    };

    /**
    *   Takes the column which was clicked and processes
    *   what should happen based on the columns state.
    */
    this.action = function (column, callback) {
        if (this.paused || this.won) {
            return 0;
        }
        if (this.map[0][column] !== 0 || column < 0 || column > 6) {
            return -1;
        }

        var done = false;
        var row = 0, i;

        // Check where the row is filled up too.
        for (i = 0; i < 5; i++) {
            if (this.map[i + 1][column] !== 0) {
                done = true;
                row = i;
                break;
            }
        }
        if (!done) {
            row = 5;
        }

        // This embedded function is to animate the game piece
        // Falling into place.
        this.animate(column, this.playerMove(this.move), row, 0, function () {
            that.map[row][column] = that.playerMove(that.move);
            that.move++;
            that.draw();
            that.check();
            that.print();
            callback();
        });
        this.paused = true;
        return 1;
    };

    /**
    *   Checks the board state to see
    *   if the win condition is met (4 pieces of the same color
    *   adjacent to each other).
    */
    this.check = function () {
        var i, j, k;
        var temp_r = 0, temp_b = 0, temp_br = 0, temp_tr = 0;
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                temp_r = 0;
                temp_b = 0;
                temp_br = 0;
                temp_tr = 0;
                for (k = 0; k <= 3; k++) {
                    // from (i,j) to right
                    if (j + k < 7) {
                        temp_r += this.map[i][j + k];
                    }
                    // from (i,j) to bottom
                    if (i + k < 6) {
                        temp_b += this.map[i + k][j];
                    }

                    // from (i,j) to bottom-right
                    if (i + k < 6 && j + k < 7) {
                        temp_br += this.map[i + k][j + k];
                    }

                    // from (i,j) to top-right
                    if (i - k >= 0 && j + k < 7) {
                        temp_tr += this.map[i - k][j + k];
                    }
                }
                if (Math.abs(temp_r) === 4) {
                    this.win(temp_r);
                } else if (Math.abs(temp_b) === 4) {
                    this.win(temp_b);
                } else if (Math.abs(temp_br) === 4) {
                    this.win(temp_br);
                } else if (Math.abs(temp_tr) === 4) {
                    this.win(temp_tr);
                }

            }
        }
        // check if draw
        if ((this.move === 42) && (!this.won)) {
            this.win(0);
        }
    };

    /**
    *   This function draws the pieces of the game
    *   which are circles.
    */
    this.drawCircle = function (x, y, r, fill, stroke) {
        this.context.save();
        this.context.fillStyle = fill;
        this.context.strokeStyle = stroke;
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        this.context.fill();
        this.context.restore();
    };

    /**
    *   This function is for drawing out the game board
    *   that contains the circle pieces.
    *   Source: http://stackoverflow.com/a/11770000/917957
    */
    this.drawMask = function () {
        this.context.save();
        this.context.fillStyle = "#ddd";
        this.context.beginPath();
        var x, y;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 7; x++) {
                this.context.arc(75 * x + 100, 75 * y + 50, 25, 0, 2 * Math.PI);
                this.context.rect(75 * x + 150, 75 * y, -100, 100);
            }
        }
        this.context.fill();
        this.context.restore();
    };
    /**
    *   This function draws everything.
    */
    this.draw = function () {
        var x, y;
        var fg_color;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 7; x++) {
                fg_color = "transparent";
                if (this.map[y][x] >= 1) {
                    fg_color = "#ff4136";
                } else if (this.map[y][x] <= -1) {
                    fg_color = "#0074d9";
                }
                this.drawCircle(75 * x + 100, 75 * y + 50, 25, fg_color, "black");
            }
        }
    };
    /**
    *   Clears the canvas. Mainly used to simulate movement
    *   in the animation.
    */
    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    /**
    *   Main animation function of the game class. This function also animates the
    *   pieces falling to the lowest available position.
    */
    this.animate = function (column, move, to_row, cur_pos, callback) {
        var fg_color = "transparent";
        if (move >= 1) {
            fg_color = "#ff4136";
        } else if (move <= -1) {
            fg_color = "#0074d9";
        }
        if (to_row * 75 >= cur_pos) {
            this.clear();
            this.drawCircle(75 * column + 100, cur_pos + 50, 25, fg_color, "black");
            this.drawMask();
            this.draw();
            window.requestAnimationFrame(function () {
                that.animate(column, move, to_row, cur_pos + 25, callback);
            });
        } else {
            callback();
        }
    };
    /**
    *   Check if a column was selected
    *   based on the x coordinate provided on call.
    */
    this.onregion = function (coord, x, radius) {
        if ((coord[0] - x)*(coord[0] - x) <=  radius * radius) {
            return true;
        }
        return false;
    };

    /**
    *   Taking in the canvas element as an input, it is called whenever the element is clicked.
    *   It was initialized and attached to a mouse event listener at the initialization of the program.
    */
    this.onclick = function (canvas, e) {
        if (this.rejectClick) {
            return false;
        }
        if (this.won) {
            this.init();
            return false;
        }
        var rect = canvas.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;

        var j, valid;
        for (j = 0; j < 7; j++) {
            if (this.onregion([x, y], 75 * j + 100, 25)) {
                this.paused = false;
                
                // AI only moves after click.
                valid = this.action(j, function () {
                    that.ai(-1);
                });
                if (valid === 1) { // give user retry if action is invalid
                    this.rejectClick = true;
                }
                break; // because there will be no 2 points that are clicked at a time
            }
        }
    };

    /**
    *   The AI for the game. What the player is playing against.
    *   The AI uses a min Max alpha beta pruning algorithm to help select the most optimal move.
    */
    this.ai = function (aiMoveValue) {
        var choice = null;

        // Copy current game state, used to compute where the Ai should go.
        var state = this.map.clone();

        // Checks the state of the game.
        function checkState(state) {
            var winVal = 0;
            var chainVal = 0;
            var i, j, k;
            var temp_r = 0, temp_b = 0, temp_br = 0, temp_tr = 0;
            for (i = 0; i < 6; i++) {
                for (j = 0; j < 7; j++) {
                    temp_r = 0;
                    temp_b = 0;
                    temp_br = 0;
                    temp_tr = 0;
                    for (k = 0; k <= 3; k++) {
                        // from (i,j) to right
                        if (j + k < 7) {
                            temp_r += state[i][j + k];
                        }

                        // from (i,j) to bottom
                        if (i + k < 6) {
                            temp_b += state[i + k][j];
                        }

                        // from (i,j) to bottom-right
                        if (i + k < 6 && j + k < 7) {
                            temp_br += state[i + k][j + k];
                        }

                        // from (i,j) to top-right
                        if (i - k >= 0 && j + k < 7) {
                            temp_tr += state[i - k][j + k];
                        }
                    }
                    chainVal += temp_r * temp_r * temp_r;
                    chainVal += temp_b * temp_b * temp_b;
                    chainVal += temp_br * temp_br * temp_br;
                    chainVal += temp_tr * temp_tr * temp_tr;

                    if (Math.abs(temp_r) === 4) {
                        winVal = temp_r;
                    } else if (Math.abs(temp_b) === 4) {
                        winVal = temp_b;
                    } else if (Math.abs(temp_br) === 4) {
                        winVal = temp_br;
                    } else if (Math.abs(temp_tr) === 4) {
                        winVal = temp_tr;
                    }

                }
            }
            return [winVal, chainVal];
        }
        /**
        *   Generates a value to helps the AI decide where to place it's piece.
        *   Depth Represents the future, how many turns into the future does the Ai want to predict to.
        */
        function value(state, depth, alpha, beta) {
            var val = checkState(state);
            if (depth >= 4) { // if slow (or memory consumption is high), lower the value
                //that.printState(state);

                // calculate value
                var retValue = 0;

                // if win, value = +inf
                var winVal = val[0];
                var chainVal = val[1] * aiMoveValue;
                retValue = chainVal;

                // If it lead to winning, then do it
                if (winVal === 4 * aiMoveValue) { // AI win, AI wants to win of course
                    retValue = 999999;
                } else if (winVal === 4 * aiMoveValue * -1) { // AI lose, AI hates losing
                    retValue = 999999 * -1;
                }
                retValue -= depth * depth;

                return [retValue, -1];
            }

            var win = val[0];
            // if already won, then return the value right away
            if (win === 4 * aiMoveValue) { // AI win, AI wants to win of course
                return [999999 - depth * depth, -1];
            }
            if (win === 4 * aiMoveValue * -1) { // AI lose, AI hates losing
                return [999999 * -1 - depth * depth, -1];
            }

            // Decide how to decide its next move.
            if (depth % 2 === 0) {
                return minState(state, depth + 1, alpha, beta);
            }
            return maxState(state, depth + 1, alpha, beta);

        }
        /**
        *	Function takes in an array of moves to go and randomly selects one to do.
        * 	Moves that appear on this input array are equally optiimal.
        */
        function choose(choice) {
            return choice[Math.floor(Math.random() * choice.length)];
        }
        /**
        *	Following Game theory, the Ai looks into the future and tries to quantify possible moves
        *	it can do into points. This is the max point approach which checks for most points.
        */
        function maxState(state, depth, alpha, beta) {
            var v = -100000000007;
            var move = -1;
            var tempVal = null;
            var tempState = null;
            var moveQueue = [];
            var j;
            for (j = 0; j < 7; j++) {
                tempState = that.fillMap(state, j, aiMoveValue);
                if (tempState !== -1) {

                    tempVal = value(tempState, depth, alpha, beta);
                    if (tempVal[0] > v) {
                        v = tempVal[0];
                        move = j;
                        moveQueue = [];
                        moveQueue.push(j);
                    } else if (tempVal[0] === v) {
                        moveQueue.push(j);
                    }

                    // alpha-beta pruning
                    if (v > beta) {
                        move = choose(moveQueue);
                        return [v, move];
                    }
                    alpha = Math.max(alpha, v);
                }
            }
            move = choose(moveQueue);

            return [v, move];
        }

        /**
        *	Following Game theory, the Ai looks into the future and tries to quantify possible moves
        *	it can do into points. This is the min point approach which checks for least points.
        */
        function minState(state, depth, alpha, beta) {
            var v = 100000000007;
            var move = -1;
            var tempVal = null;
            var tempState = null;
            var moveQueue = [];
            var j;

            for (j = 0; j < 7; j++) {
                tempState = that.fillMap(state, j, aiMoveValue * -1);
                if (tempState !== -1) {

                    tempVal = value(tempState, depth, alpha, beta);
                    if (tempVal[0] < v) {
                        v = tempVal[0];
                        move = j;
                        moveQueue = [];
                        moveQueue.push(j);
                    } else if (tempVal[0] === v) {
                        moveQueue.push(j);
                    }

                    // alpha-beta pruning
                    if (v < alpha) {
                        move = choose(moveQueue);
                        return [v, move];
                    }
                    beta = Math.min(beta, v);
                }
            }
            move = choose(moveQueue);

            return [v, move];
        }
        var choice_val = maxState(state, 0, -100000000007, 100000000007);
        choice = choice_val[1];
        var val = choice_val[0];
        console.info("AI " + aiMoveValue + " choose column: " + choice + " (value: " + val + ")");

        this.paused = false;
        var done = this.action(choice, function () {
            that.rejectClick = false;
        });

        // if there happens to be an error choose a random column until a valid one is selected.
        while (done < 0) {
            console.error("Falling back to random agent");
            choice = Math.floor(Math.random() * 7);
            done = this.action(choice, function () {
                that.rejectClick = false;
            });
        }

    };
    // Initialize the game.
    this.init();
}
document.addEventListener('DOMContentLoaded', function () {
    this.game = new Game();
});
