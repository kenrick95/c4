class Utils {
  static drawCircle(context : CanvasRenderingContext2D, {x = 0, y = 0, r = 0, fill = '', stroke = ''}) {
    context.save();
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
  }
  /**
   * @see http://stackoverflow.com/a/11770000/917957
   * @static
   * @param context Canvas 2D Context
   * @param board   current board
   */
  static drawMask(board : Board) {
    const context = board.context;
    context.save();
    context.fillStyle = "#ddd";
    context.beginPath();
    let x, y;
    for (y = 0; y < board.row; y++) {
      for (x = 0; x < board.column; x++) {
        context.arc(75 * x + 100, 75 * y + 50, 25, 0, 2 * Math.PI);
        context.rect(75 * x + 150, 75 * y, -100, 100);
      }
    }
    context.fill();
    context.restore();
  }

  static clearCanvas(board : Board) {
     board.context.clearRect(0, 0, board.canvas.width, board.canvas.height);
  }

  static isCoordOnColumn(coord : {x: number, y: number}, x : number, radius : number) {
    return ((coord.x - x) * (coord.x - x) <=  radius * radius);
  }
}