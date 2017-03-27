c4
==

**c4**, stands for **Connect Four**, is a browser game written in TypeScript and utilizes HTML's `canvas`. Player is playing against an AI that uses Minimax algorithm and alpha-beta pruning. The evaluation function is hard-coded, and hence the AI may not be moving using the most optimal move.

## Play
* [kenrick95.github.io/c4/demo](//kenrick95.github.io/c4/demo/)
* [Windows Store](http://apps.microsoft.com/windows/app/c6ebc0bb-7cd8-48ce-b538-72895b8834c6)

## How to Play?
In each turn, drop a piece in one of the seven column by clicking the column.

### Objective
Connect four of your pieces vertically, horizontally, or diagonally before the other player do so.

### More info about the game
Read [Wikipedia page on Connect Four](https://en.wikipedia.org/wiki/Connect_Four)

## Browser compatibility
- Require browser that supports ES2015's Promise.
- Should be good in latest Firefox, Edge, Chrome, Opera, and Safari; but not IE.

## Developer notes
Open up browser console to see the "value" of the move chosen by AI.

### A bit of history
This project was started in December 2013, way back before I took Software Engineering class in my uni. Way back before ES2015 and TypeScript was widespread. Now that it is 2017, this project got its first pull request ever from not me and it made me want to improve the quality of code. Since I am all-excited about TypeScript and ES2017's async/await at the moment, I decided to rewrite the whole project with those in mind. Unfortunately, due to some obscure TypeScript error, I raised the browser compatibility requirement to at least browsers that has ES2015 implemented (due to Promise I think).

I think this rewrite has one goal: to make the player extensible, so more kind of AI or player (multiplayer, maybe?) could be implemented. At the time of writing this paragraph, the rewrite project is now on par with the old project in terms of features and functionalities.

### To-dos
- [x] Refactor magic numbers to constants and variables
- [x] Make the game mobile responsive
- [x] Make game mode chooser
- [x] Game mode: Human vs Human (offline)
- [x] Game mode: Human vs Human (local network, via Flyweb)
- [x] Game mode: Ai vs Ai
- [x] Add game title to welcome screen (mode selector)
- [x] Refactor out winning message to write on DOM
- [x] Add how to play at welcome screen (mode selector)
- [ ] Implement other kind of players: better AI? better Human? :grin:

### Bugs
- [x] On FlyWeb mode, there could be inconsistent game state due to race condition, maybe?

## License
This work is licensed under MIT License.
