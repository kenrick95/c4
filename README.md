c4
==

![Test](https://github.com/kenrick95/c4/workflows/Test/badge.svg)

**c4**, stands for **Connect Four**, is a browser game written in TypeScript and utilizes HTML's `canvas`. Player is playing against an AI that uses Minimax algorithm and alpha-beta pruning. The evaluation function is hard-coded, and hence the AI may not be moving using the most optimal move.

## Play
* [kenrick95.github.io/c4](https://kenrick95.github.io/c4/)

## Gameplay
### Objective
*Connect four* of your game pieces vertically, horizontally, or diagonally before the other player do so.

### How to move?
At each turn, player will drop a game piece in one of the seven columns by clicking on the chosen column.

### More info
Read [Wikipedia page on Connect Four](https://en.wikipedia.org/wiki/Connect_Four)

## Browser compatibility
- Should be good in latest Firefox, Edge, Chrome, Opera, Safari, and IE.

## Contributing
Contributions are welcome! I'm happy to accept any kind of contributions, pull requests, or bug reports.

### Developing

1. Fork and clone this repository
2. Install dependencies
  ```
  yarn install
  ```
3. Start local development server
  ```
  yarn start
  ```
4. Make your changes at either `browser/`, `core/`, or `server/`
5. Test it out at http://localhost:1234/
6. After you are happy with your changes, please submit your Pull Request!

## License
This work is licensed under MIT License.
