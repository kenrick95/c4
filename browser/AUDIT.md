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

## Proposed technical solutions

Written on 2026-09-19, after the findings-only commit was pushed. These are
implementation proposals and acceptance criteria, not completed fixes.

### B01 — Construct dialogs from text and owned DOM elements

Replace the HTML-string message API with structured content: a title, plain-text
paragraphs, and optional controls constructed by application code. For example,
the result renderer receives the winner's label as data and sets a paragraph's
`textContent`. The message helper installs the resulting nodes with
`replaceChildren()`; it never parses player-supplied text as markup.

Migrate every caller, including local results, online results, connection errors,
game-start notices, and the share dialog. Build the share input and copy button
with `document.createElement()`, set the input's `.value`, and attach the copy
handler directly. Construct the share address with `URL` and `searchParams.set()`
so existing query parameters and fragments are handled correctly.

Use a stable heading element for the dialog title, shared with B05. Names and
messages remain plain text even if they contain quotes, angle brackets, emoji,
or newlines. Do not introduce a general-purpose "trusted HTML" escape hatch for
names or URLs.

Acceptance criteria:

- A malicious-looking opponent name is displayed literally in an online result;
  it creates no additional elements, event handlers, or network requests.
- The same guarantee holds for a local winner's name.
- Share links and copy behavior still work, including URLs with existing query
  parameters. Normal dialog titles and layout remain readable.

### B02 — Make a game session cancellable across every asynchronous boundary

Give each run a generation identifier and an `AbortController`. Capture both when
the run begins. Resetting or ending a game invalidates that generation and aborts
its work before clearing the board. A new game gets a fresh generation; an old
run must not gain permission to write merely because a new run is active.

Apply cancellation through the full call chain:

1. Extend player action requests and board move application with an optional
   cancellation signal. Update the browser and built-in core implementations;
   keep existing callers without a signal working.
2. Human and shadow players settle pending action promises on abort and clear
   their stored resolvers. Remove abort handlers when a promise settles, and make
   sure cleanup from an older request cannot clear a newer request's resolver.
3. Make the animation-frame helper cancellable. Aborting it must both cancel the
   queued frame and settle its promise; cancelling the frame alone leaves the
   game awaiting forever. Check cancellation before every draw and before
   committing a disc to `board.map`.
4. Check the captured generation after each `await` in `move()` and `start()`,
   before changing flags, advancing players, sending network moves, announcing a
   winner, or running UI hooks. Guard cleanup paths too, so an old run's `finally`
   block cannot reset a newer run's controls.
5. Catch expected cancellation at the run boundary as a normal stop. Report
   unexpected errors and place the game in a non-playable state; do not leave an
   unhandled rejected promise or a loop repeatedly calling a no-op `move()`.

Treat reset, disposal, and connection loss as explicit transitions. Prevent two
active `start()` loops for one generation. On disconnect, invalidate the active
run before updating the connection UI. An online reset prepares the next run;
the corresponding ready message starts it once. Preserve the existing starting
player policy unless the server and both clients are updated together.

Because `GameBase`, `Player`, and `BoardBase` are public core APIs used by the
server, verify subclass compatibility and server behavior as part of the change.
Generation checks protect the game loop even if an external player implementation
ignores the optional signal; they cannot undo side effects inside an external
board implementation that ignores cancellation. Document that boundary.

Acceptance criteria:

- End during an action wait or animation: no later board mutation, repaint,
  status update, move transmission, or re-enabling of controls occurs.
- End and immediately start another game: the previous run cannot affect it.
- Reset and disconnect settle outstanding built-in action promises without
  unhandled rejections. Repeated `start()` calls cannot duplicate moves.
- Local replay, AI turns, and online rematches still progress correctly.

### B03 — Render an accessible board and announce meaningful state changes

Add a browser presentation module that derives the semantic view from the same
committed `board.map`, player identities, and turn state used by the visual game.
Update it on initialization, successful moves, resets, and terminal transitions.
Keep DOM concerns out of the core package and do not maintain a second rules
engine for accessibility.

Provide a six-row, seven-column HTML table with a caption, column headers, and
row headers. Define row 1 as the top and column 1 as the left, matching the canvas
and buttons. Cell text identifies "empty", "Player 1", or "Player 2", with a
legend connecting those stable identities to the players' names. This avoids
depending on color, emoji pronunciation, or distinct user-entered names.

The table can be visually hidden while remaining available to assistive
technology. Do not use `display: none`, `hidden`, or `aria-hidden` on it. Its cells
are for reading, not 42 additional tab stops. Keep the existing seven action
buttons, and optionally describe their available spaces or full-column state.
Keep the canvas hidden from assistive technology once the semantic equivalent
is present.

Use `.section-message` as the single polite announcement region. Write concise
text after committed changes, for example: "Player 1 placed a disc in column 4,
row 6. Player 2's turn." Announce initial turns, connection changes, and game
results too. Compute the mover and next player explicitly: the current
`afterMove()` hook runs before `currentPlayerId` advances. Never announce a move
that was rejected or cancelled, or announce individual animation frames.

Coordinate announcements with modal dialogs. A result dialog can deliver the
result while open; avoid announcing it twice through a background live region.
When a dialog closes, restore the current useful status rather than replaying a
queue of obsolete updates. Update existing table cells in place to reduce
disruption to screen-reader navigation. Preserve the accepted focus behavior:
the next Tab begins at the first playable column when a human turn starts.

Acceptance criteria:

- A screen-reader user can inspect every cell, distinguish players, and determine
  whose turn it is without seeing the canvas.
- Local, AI, and remote moves update the table and produce accurate, concise
  announcements; reset clears the table and announces the new state.
- Full columns remain inspectable even when their action buttons are disabled.
- Test manually with a screen reader as well as inspecting the DOM. Automated
  accessibility checks cannot establish that announcements are useful or timely.

### B04 — Define ownership and make teardown idempotent

Give the app one visual board for the lifetime of the page and pass it into game
initializers, including spectator mode. Games reset that board, but do not create
new resize subscriptions. Use B02's cancellation guarantees before transferring
the shared board from one game to the next.

Add an explicit `Board.dispose()` for final page teardown. The resize helper
should return an unsubscribe function; removing a subscription must also cancel
or invalidate queued resize work. Store that unsubscribe function on the board.

Each game handler owns its column controls, canvas events, share-button events,
and socket handlers. Give it an idempotent `dispose()` and have `app.ts` call it
before replacing the current game. Disposal should:

1. Mark the handler inactive and abort its run.
2. Disable and dispose its controls and detach owned DOM/socket listeners.
3. Close its socket and release references, without allowing close callbacks to
   overwrite the next game's UI.

Capture each socket instance in its callbacks and ignore events when that socket
is no longer current or its owner has been disposed. Remove the exact
`showShareLink` listener that was registered. Use named handlers or listener
cancellation signals so ownership is explicit. Handle pending connection setup
as well as fully established games.

Acceptance criteria:

- Repeatedly start and end games, then resize: only the current board renders.
- After several online sessions, clicking Share invokes only the current
  session's handler and shows its link.
- Late messages, errors, close events, and queued resize callbacks from an old
  session cannot change a new game's DOM or canvas.
- Calling disposal twice is harmless; a new game still registers its controls
  exactly once.

### B05 — Finish native form and dialog semantics

Add `id="player-1-name"` and `id="player-2-name"` to the existing inputs so their
labels' `for` values resolve. Continue changing the label text with the selected
mode; hide and disable only inputs that are irrelevant to that mode.

Replace the mode-section wrapper with a `fieldset` and use a `legend` for
"Playing mode". Adjust its CSS to preserve the form's existing layout. Keep the
native radio inputs and their individual labels.

Assign stable IDs to the settings heading and the message dialog's title. Point
each dialog's `aria-labelledby` at its own heading. Use `aria-describedby` only
for a short explanation where it helps; do not make the entire form the dialog
description. Give the share URL input an explicit label in B01's DOM renderer.

Retain native modal focus containment. When a result is dismissed, focus the
visible Play again button for local and spectator games; keep B03's deferred
board focus behavior for a playable online turn. After Play again, the next Tab
must reach the first available column as it does after starting a game.

Acceptance criteria:

- Each visible name input has one associated label, and clicking that label
  focuses the input.
- The radio group and each dialog have the expected accessible names.
- Mode switching does not leave focus in hidden inputs. Dialog dismissal, replay,
  and board tab order work using only the keyboard.

### B06 — Make browser behavior part of the repository's test suite

Add Playwright as a browser development dependency and check in its configuration
and tests under `browser/`. Replace the browser's placeholder `test` command with
the browser test runner. Configure it to start a local Vite server on a fixed
loopback address and port; CI must start a fresh server rather than reusing an
unrelated process.

Install the selected Playwright browser and required system libraries in the
existing test workflow before its workspace test step. Use the repository's
locked dependencies and supported Node version. Start with Chromium in CI;
expand to Firefox and WebKit when their jobs and installation requirements are
added deliberately. Upload traces or screenshots on failure, and use a bounded
job timeout so a stalled game fails the build.

Cover the observable regressions from B01–B05:

- Names are rendered literally in local and online result dialogs.
- Start game, Play again, and new human turns make the next Tab reach column 1,
  or the first non-full column. The container has no focus ring, while the
  focused action button does.
- Opponent turns, animations, full columns, and ended/disconnected games prevent
  actions through buttons, canvas clicks, and shortcuts. Dialogs and text inputs
  suppress game shortcuts.
- End/reset during pending work cannot revive an old game; repeated sessions do
  not accumulate active handlers.
- Board text, status announcements, input labels, and dialog names match actual
  state and remain correct after mode changes.

Use a controllable local WebSocket fixture for turn changes, delayed messages,
disconnects, and rematches. Avoid the public game server. Exercise the real
browser game modules and include a separate local-server integration check when
changing the core/server cancellation contract.

Use deterministic moves or a controlled AI fixture rather than expecting a
particular random AI response. Synchronize on observable state, messages, or a
controllable animation boundary instead of fixed sleeps. For cancellation tests,
hold a move in flight until the test explicitly ends or resets the game, then
release it and verify no stale effects occur.

Acceptance criteria:

- The workspace test step runs real browser tests and fails when a covered
  regression is introduced.
- The tests run from a fresh checkout with documented installation commands and
  no dependencies on temporary local audit scripts or unrelated repositories.
- Failure artifacts identify the failing user flow. Manual screen-reader checks
  remain part of B03's verification rather than being replaced by test snapshots.

## Implementation sequence

1. Establish the minimal B06 harness with B01's regression and fix B01.
2. Implement B02's cancellation contract with core and browser regression tests.
3. Implement B04's lifecycle ownership using that cancellation contract.
4. Implement B03's semantic board and announcements, and B05's form/dialog
   semantics. Reuse the safe message renderer and lifecycle hooks.
5. Complete the B06 scenario coverage and manual nonvisual-play checks.

Keep implementation changes separate from this audit document. Each follow-up
should identify the finding it closes and record which acceptance criteria were
verified.
