function Game() {
	this.map = Array();
	this.paused = false;
	this.won = false;
	this.rejectClick = false;
	this.move = 0;
	this.init = function () {
		for (var i=0; i <= 6; i++) {
			this.map[i] = Array();	
			for (var j=0; j<=7; j++) {
				this.map[i][j] = 0;	
			}
		}
		this.canvas = document.getElementsByTagName("canvas")[0];
		var that = this;
		this.canvas.addEventListener('click', function (e) {
			that.onclick(that.canvas, e);
		});	
		this.context = this.canvas.getContext('2d');
	};
	
	this.playerMove = function () {
		if (this.move % 2 === 0) {
			return 1;
		} else {
			return -1;
		}
	}
	
	this.print = function () {
		var msg = "\n";
		msg += "Move: " + this.move;
		msg += "\n";
		for (var i=0; i < 6; i++) {
			for (var j=0; j<7; j++) {
				msg += " " + this.map[i][j];	
			}
			msg += "\n";
		}
		console.log(msg);
		this.draw();
	}
	this.win = function (player) {
		this.paused = true;
		this.won = true;
		var msg = null;
		if (player > 0) {
			msg = "Player 1 wins";
		} else if (player < 0 ) {
			msg = "Player 2 wins";
		} else {
			msg = "It's a draw";
		}
		this.context.save();
		this.context.fillStyle = "white";
		this.context.fillRect(0, 0, 150, 24);
		this.context.restore();
		this.context.save();
		this.context.font = '14pt Helvetica';
		this.context.fillText(msg, 10, 20);
		this.context.restore();
		
		console.info(msg);
	}
	this.action = function(column) {
		if (this.paused || this.won) {
			return 0;
		}
		if (this.map[0][column] !== 0 || column < 0 || column > 6) {
			return -1;
		} else {
			var done = false;
			for (var i=0; i<5; i++) {
				if (this.map[i+1][column] !== 0) {
					this.map[i][column] = this.playerMove(this.move);
					done = true;
					break;
				}
			}
			if (!done) {
				this.map[5][column] = this.playerMove(this.move);
			}
			this.move++;
			this.check();
		}
		this.paused = true;
		this.print();
		return 1;
	}
	
	this.check = function() {
		for (var i=0; i<6; i++) {
			for (var j=0; j<7; j++) {
				var temp_r = 0, temp_b = 0, temp_br = 0, temp_tr = 0;
				for (var k=0; k<=3; k++) {
					//from (i,j) to right
					if (j+k < 7) temp_r += this.map[i][j+k];
					
					//from (i,j) to bottom
					if (i+k < 6) temp_b += this.map[i+k][j];
					
					//from (i,j) to bottom-right
					if (i+k < 6 && j+k < 7) temp_br += this.map[i+k][j+k];
					
					//from (i,j) to top-right
					if (i-k >= 0 && j+k < 7) temp_tr += this.map[i-k][j+k];
				}
				if (Math.abs(temp_r) === 4) this.win(temp_r);
				else if (Math.abs(temp_b) === 4) this.win(temp_r);
				else if (Math.abs(temp_br) === 4) this.win(temp_br);
				else if (Math.abs(temp_tr) === 4) this.win(temp_tr);
				
			}
		}
	}
	
	this.drawCircle = function (x, y, r, fill, stroke) {
		this.context.save();
		this.context.fillStyle = fill;
		this.context.strokeStyle = stroke;
		this.context.beginPath();
		this.context.arc(x, y, r, 0, 2 * Math.PI, false);
		this.context.stroke();
		this.context.fill();
		this.context.restore();
	};
	this.draw = function () {
		for (var y = 0; y < 6; y++) {
			for (var x = 0; x < 7; x++) {
				var fg_color = "white";
				if (this.map[y][x] >= 1) {
					fg_color = "red";
				} else if (this.map[y][x] <= -1) {
					fg_color = "blue";
				}
				this.drawCircle(75*x + 100, 75*y + 50, 25, fg_color, "black");
			}
		}
	};
	this.onregion = function (coord, x, radius) {
		if ((coord[0] - x)*(coord[0] - x) <=  radius*radius) {
			return true;
		}
		return false;
	};
	this.oncircle = function (coord, centerCoord, radius) {
		if ((coord[0] - centerCoord[0])*(coord[0] - centerCoord[0]) <=  radius*radius
		&&   (coord[1] - centerCoord[1])*(coord[1] - centerCoord[1]) <=  radius*radius) {
			return true;
		}
		return false;
	};
	
	this.onclick = function (canvas, e) {
		if (this.rejectClick) {
			return false;
		}
		var context = canvas.getContext('2d'),
		rect = canvas.getBoundingClientRect(),
		x = e.clientX - rect.left,// - e.target.scrollTop,
		y = e.clientY - rect.top;// - e.target.scrollLeft;
		
		console.log("(" + x + ", " + y + ")");
		
		for (var j = 0; j < 7; j++) {
			if (this.onregion([x,y], 75*j + 100, 25)) {
				console.log("clicked region " + j);
				this.paused = false;
				this.action(j);
				this.rejectClick = true;
				
				this.ai();
				
				break; //because there will be no 2 points that are clicked at a time
			}
		}
		
	};
	
	this.ai = function () {
		var choice = null;
		choice = Math.floor(Math.random() * 7);
		this.paused = false;
		var done = this.action(choice);
		while (done < 0) {
			choice = Math.floor(Math.random() * 7);
			done = this.action(choice);
		}
		
		this.rejectClick = false;
	};
	this.init();
	
	
	
}
document.addEventListener('DOMContentLoaded', function() {
	this.game = new Game();
	this.game.print();
});
