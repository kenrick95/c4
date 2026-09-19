import { expect, test } from '@playwright/test'

test('keyboard play updates the accessible board and announces the next turn', async ({
  page,
}) => {
  await page.goto('/')

  const setupDialog = page.locator('.init-screen')
  const liveRegion = page.locator('.section-message')
  const boardState = page.locator('.board-state')
  const firstColumn = page.locator('.game-control').first()

  await expect(setupDialog).toBeVisible()
  await expect(page.locator('.section-canvas')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(liveRegion).toHaveAttribute('role', 'status')
  await expect(liveRegion).toHaveAttribute('aria-live', 'polite')
  await expect(boardState).toContainText('Connect Four board')

  await page
    .getByRole('radio', { name: 'Offline: Human player vs human player' })
    .check()
  await page.getByRole('button', { name: 'Start game' }).click()

  await expect(setupDialog).not.toBeVisible()
  await expect(firstColumn).toBeEnabled()

  await page.keyboard.press('Tab')
  await expect
    .poll(() =>
      page.evaluate(() => document.activeElement?.getAttribute('data-column')),
    )
    .toBe('0')

  await page.keyboard.press('1')

  await expect(boardState).toContainText('Player 1: Player 1')
  await expect(liveRegion).toHaveText(
    "Player 1 placed a disc in column 1, row 6. It is now Player 2's turn.",
  )
  await expect(firstColumn).toBeEnabled()
})

test('replay returns keyboard focus to the first column', async ({ page }) => {
  await page.goto('/')

  const setupDialog = page.locator('.init-screen')
  const liveRegion = page.locator('.section-message')
  const resultDialog = page.locator('.message-body')
  const playAgainButton = page.getByRole('button', { name: 'Play again' })

  await page
    .getByRole('radio', { name: 'Offline: Human player vs human player' })
    .check()
  await page.getByRole('button', { name: 'Start game' }).click()
  await expect(setupDialog).not.toBeVisible()

  for (const [shortcut, nextTurn] of [
    ['1', "Player 2's turn."],
    ['2', "Player 1's turn."],
    ['1', "Player 2's turn."],
    ['2', "Player 1's turn."],
    ['1', "Player 2's turn."],
    ['2', "Player 1's turn."],
    ['1', 'Player 1 won.'],
  ]) {
    await page.keyboard.press(shortcut)
    await expect(liveRegion).toContainText(nextTurn)
  }

  await expect(resultDialog).toBeVisible()
  await expect(resultDialog).toContainText('Player 1 won.')
  await resultDialog.getByRole('button', { name: 'OK' }).click()
  await expect(playAgainButton).toBeFocused()

  await playAgainButton.click()
  await expect(page.locator('.game-control').first()).toBeEnabled()
  await page.keyboard.press('Tab')
  await expect
    .poll(() =>
      page.evaluate(() => document.activeElement?.getAttribute('data-column')),
    )
    .toBe('0')
})

test('renders a winning player name as text instead of markup', async ({
  page,
}) => {
  const playerName = '<img src="invalid" onerror="window.xssProbe = true">'

  await page.addInitScript(() => {
    Object.assign(window, { xssProbe: false })
  })
  await page.goto('/')

  const liveRegion = page.locator('.section-message')
  const resultDialog = page.locator('.message-body')

  await page
    .getByRole('radio', { name: 'Offline: Human player vs human player' })
    .check()
  await page.locator('#player-1-name').fill(playerName)
  await page.getByRole('button', { name: 'Start game' }).click()

  for (const [shortcut, nextTurn] of [
    ['1', "Player 2's turn."],
    ['2', `${playerName}'s turn.`],
    ['1', "Player 2's turn."],
    ['2', `${playerName}'s turn.`],
    ['1', "Player 2's turn."],
    ['2', `${playerName}'s turn.`],
    ['1', `${playerName} won.`],
  ]) {
    await page.keyboard.press(shortcut)
    await expect(liveRegion).toContainText(nextTurn)
  }

  await expect(resultDialog).toBeVisible()
  await expect(resultDialog.locator('p').first()).toHaveText(
    `${playerName} won.`,
  )
  await expect(resultDialog.locator('img')).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate(
        () => Object.getOwnPropertyDescriptor(window, 'xssProbe')?.value,
      ),
    )
    .toBe(false)
})

test('ignores column shortcuts while a text input or modal dialog is active', async ({
  page,
}) => {
  await page.goto('/')

  const liveRegion = page.locator('.section-message')
  const boardState = page.locator('.board-state')
  const messageDialog = page.locator('.message-body')

  await page
    .getByRole('radio', { name: 'Offline: Human player vs human player' })
    .check()
  await page.getByRole('button', { name: 'Start game' }).click()
  await expect(liveRegion).toHaveText("Player 1's turn.")

  await page.evaluate(() => {
    const input = document.createElement('input')
    input.className = 'keyboard-shortcut-test-input'
    input.type = 'text'
    document.body.append(input)
    input.focus()
  })
  await page.keyboard.press('1')

  await expect(page.locator('.keyboard-shortcut-test-input')).toHaveValue('1')
  await expect(boardState).not.toContainText('Player 1: Player 1')

  await page.evaluate(() => {
    document.querySelector<HTMLDialogElement>('.message-body')?.showModal()
  })
  await expect(messageDialog).toBeVisible()
  await page.keyboard.press('1')

  await expect(boardState).not.toContainText('Player 1: Player 1')
  await page.evaluate(() => {
    document.querySelector<HTMLDialogElement>('.message-body')?.close()
  })
  await page.locator('.keyboard-shortcut-test-input').evaluate((input) => {
    input.remove()
  })
  await page.locator('.game-controls').focus()
  await page.keyboard.press('1')

  await expect(boardState).toContainText('Player 1: Player 1')
  await expect(liveRegion).toContainText("Player 2's turn.")
})
