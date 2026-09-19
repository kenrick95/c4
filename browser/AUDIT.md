# Browser code audit

Audit date: 2026-09-18. Reviewed revision: `e43a2c850f37bb6eb65a1bba093dbd698890e5e8`
(master after PR #104).

Scope: the browser package and the core game lifecycle it uses. This document
records observed problems; it does not claim a complete security or accessibility
audit. None of these findings has been fixed by this documentation change.

## Problems

### B01 — Player names can execute JavaScript in result dialogs

Priority: high. Evidence: source inspection and a local Chromium reproduction.

Online game setup stores the opponent's supplied name as the shadow player's
label. The game-ended handler interpolates that label into an HTML string.
`showMessage()` assigns the string to `innerHTML`, allowing a name containing HTML
with an event handler to execute JavaScript in the other player's page when the
name appears in a result dialog. Local winner messages use the same unsafe path.

The reproduction used a mocked opponent and an invalid image with an event
handler that set a harmless page-local flag. No live match or external data
transfer was involved.

Affected code:

- [Online player names and result messages](src/game/game-online-2p.ts).
- [Local result messages](src/game/game-local.ts).
- [`showMessage()` HTML insertion](src/utils/message.ts).

### B02 — Ending a game does not cancel its pending move

Priority: high. Evidence: source inspection and a local Chromium reproduction.

`GameBase.end()` resets the board and marks the game ended, but `move()` does not
recheck that state after awaiting a player action or a board update. The browser
board's falling-disc animation also continues independently of the game state.

In the reproduction, ending a game during a drop left zero pieces immediately
after `end()`. When the pending move completed, the board contained one piece and
`isMoveAllowed` was true even though `isGameEnded` was still true. Because game
instances share the page's canvas, old asynchronous work can repaint it after the
user leaves a game or starts another one.

Affected code:

- [`GameBase.end()`, `start()`, and `move()`](../core/src/game/game-base.ts).
- [Board animation and move application](src/board/index.ts).
- [Human action promises](../core/src/player/player-human.ts) and
  [remote action promises](../core/src/player/player-shadow.ts).

### B03 — Screen-reader users cannot inspect the game state

Priority: high for nonvisual play. Evidence: source inspection and browser DOM
checks; a full screen-reader evaluation has not been performed.

The canvas is hidden from assistive technology. The seven column buttons expose
actions, but there is no equivalent representation of the occupied board cells.
A player can submit a move without being able to inspect either player's discs.

The `.section-message` element has live-region attributes but no code writes to
it. It remained empty after online game start and game end in the browser check.
Turn and connection updates go to separate status elements that are not live
regions. Adding the attributes alone therefore did not provide announcements.

Affected code:

- [Canvas, column buttons, live region, and status box](index.html).
- [Local status updates](src/game/game-local.ts).
- [Online status updates](src/game/game-online-2p.ts).
- [Column control state](src/game/game-controls.ts).

### B04 — Game teardown leaves event listeners attached

Priority: medium. Evidence: source inspection.

Each new `Board` registers a window resize listener through a helper that offers
no removal method. The initial screen and successive games create separate board
instances for the same canvas, retaining previous boards and their callbacks.

Online games also add a share-button listener without removing it on exit. Socket
handlers can still update shared status elements when an old connection closes.
The column controls have a disposal method, but the rest of the game does not
follow the same ownership and cleanup pattern.

Affected code:

- [Board resize subscription](src/board/index.ts).
- [Resize helper](src/board/utils.ts).
- [Initial board creation](src/app.ts).
- [Online share-button and socket handlers](src/game/game-online-2p.ts).

### B05 — Form labels and dialog names are incomplete

Priority: medium. Evidence: source inspection and browser DOM checks.

Both player-name labels have `for` attributes, but the inputs have no matching
`id` attributes. The browser reported zero associated labels for each input.
The game-mode radios are individually labelled but lack a semantic group label.
Neither dialog explicitly associates its heading with the dialog's accessible
name.

Affected code: [Settings form and dialogs](index.html), and
[dynamically generated message content](src/utils/message.ts).

### B06 — Browser CI does not exercise browser behavior

Priority: medium. Evidence: package scripts and CI workflow inspection.

The browser package's test command is `echo 'OK'`. CI runs the command, but it
cannot detect regressions in focus order, turn availability, dialogs, replay,
animations, or connection teardown. The Chromium checks used during development
and this audit were temporary local scripts, not checked-in regression tests.

Affected code:

- [Browser package scripts](package.json).
- [Test workflow](../.github/workflows/test.yml).

## Suggested priority

Address B01 and B02 first. Complete the nonvisual state representation in B03,
make cleanup consistent in B04, and finish the semantics in B05. Add permanent
regression coverage from B06 alongside each corresponding fix.
