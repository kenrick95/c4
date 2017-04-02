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
- Should be good in latest Firefox, Edge, Chrome, Opera, and Safari; but not IE.

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
  gulp bundle
  ```
5. Open `index.html` in your browser
6. After you are happy with your changes, please submit your Pull Request!

There are also the following Gulp commands available for use:
- `gulp watch`: to watch for file changes and auto-bundle
- `gulp serve`: to serve a local server with auto-bundle-and-refresh
- `gulp ts-lint`: to lint the TypeScript files and standardize syntax
- `gulp bundle`: to bundle everything
- `gulp bundle-only-main`: to bundle only `app.ts` and its dependencies
- `gulp bundle-only-client`: to bundle only `app-flyweb-client.ts` and its dependencies

### Development guidelines

- Two spaces for indentation, line-break at end of file
- I prefer no semicolons, but not a hard rule
- I also prefer `async..await` over callbacks and Promises
- Also other requirements that's too tedious to list down, just run `gulp ts-lint` and fix the errors please :sweat_smile:

## A bit of history
This project was started in December 2013, way back before I took Software Engineering class in my uni, way back before ES2015 and TypeScript is cool. Fast forward to 2017, this project got its first pull request ever and it made me want to improve the code quality. Since I am all-excited about TypeScript and ES2017's async/await at the moment, I decided to rewrite the whole project with those techs. Unfortunately, due to some obscure TypeScript error, I raised the browser compatibility requirement to at least browsers that has ES2015's Promise implemented.

## License
This work is licensed under MIT License.
