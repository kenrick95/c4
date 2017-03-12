c4
==

**c4**, stands for **Connect Four**, is a browser game in JavaScript using HTML5 features (canvas). I also incorporate an AI using Minimax algorithm and alpha-beta pruning. The evaluation function is hard-coded, and hence the AI may not be moving using the most optimal move.

## Play
* [kenrick95.github.io/c4/demo](//kenrick95.github.io/c4/demo/)
* [Windows Store](http://apps.microsoft.com/windows/app/c6ebc0bb-7cd8-48ce-b538-72895b8834c6)

## How to Play?
In each turn, drop a piece in one of the seven column.

### Objective
Connect four of your pieces vertically, horizontally, or diagonally before the other player do so.

### More info
Read [Wikipedia page on Connect Four](https://en.wikipedia.org/wiki/Connect_Four)

## Compatibility
- Require browser that supports ES2015's Promise.
- Should be good in latest Firefox, Edge, Chrome, Opera, and Safari; but not IE.

## Developer notes
Open up browser console to see the "value" of the move chosen by AI.

### A bit of history
This project was started in December 2013, way back before I took Software Engineering class in my uni. Way back before ES2015 and TypeScript was widespread. Now that it is 2017, I am excited to rewrite the whole project in TypeScript using latest EcmaScript syntax (like async..await).

This rewrite has one goal: to make the player extensible, so more kind of AI or player (multiplayer, maybe?) could be implemented.

## License
This work is licensed under MIT License.
