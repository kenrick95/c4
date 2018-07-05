c4
==

**c4**, stands for **Connect Four**, is a browser game written in TypeScript and utilizes HTML's `canvas`. Player is playing against an AI that uses Minimax algorithm and alpha-beta pruning. The evaluation function is hard-coded, and hence the AI may not be moving using the most optimal move.

## Play
* [kenrick95.github.io/c4](//kenrick95.github.io/c4/)
* [Windows Store](http://apps.microsoft.com/windows/app/c6ebc0bb-7cd8-48ce-b538-72895b8834c6)

## Gameplay
### Objective
*Connect four* of your game pieces vertically, horizontally, or diagonally before the other player do so.

### How to move?
At each turn, player will drop a game piece in one of the seven columns by clicking on the chosen column.

### More info
Read [Wikipedia page on Connect Four](https://en.wikipedia.org/wiki/Connect_Four)

## Browser compatibility
- Require browser that supports ES2015's Promise.
- Should be good in latest Firefox, Edge, Chrome, Opera, Safari, and IE.

## Contributing
Contributions are welcome! I'm happy to accept any kind of contributions, pull requests, or bug reports.

### Developing

1. Fork and clone this repository
2. Install dependencies
  ```
  yarn install
  ```
3. Make your changes at `src/`
4. Generate `dist/` folder:
  ```
  yarn build
  ```
5. Open `index.html` in your browser
6. After you are happy with your changes, please submit your Pull Request!

## License
This work is licensed under MIT License.
