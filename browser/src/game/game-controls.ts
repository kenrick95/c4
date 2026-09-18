function isTextInput(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
  )
}

export function activateGameControls(
  onColumnSelected: (column: number) => void,
  isColumnAvailable: (column: number) => boolean,
) {
  const gameControls = document.querySelector<HTMLElement>('.game-controls')
  const controls = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.game-control'),
  )
  const dialogs = Array.from(document.querySelectorAll('dialog'))
  let isYourTurn = false
  let focusPending = false
  let disposed = false

  function focusStart() {
    if (
      !focusPending ||
      !isYourTurn ||
      document.querySelector('dialog[open]')
    ) {
      return
    }
    // Focus just before the buttons so the next Tab reaches column 1.
    gameControls?.focus({ preventScroll: true })
    focusPending = false
  }

  function setTurn(enabled: boolean) {
    if (disposed) {
      return
    }
    const turnStarted = enabled && !isYourTurn
    isYourTurn = enabled
    for (const [column, control] of controls.entries()) {
      control.disabled = !enabled || !isColumnAvailable(column)
    }
    if (!enabled) {
      focusPending = false
    } else if (turnStarted) {
      focusPending = true
      focusStart()
    }
  }

  function playColumn(column: number) {
    if (
      disposed ||
      !isYourTurn ||
      !controls[column] ||
      controls[column].disabled ||
      document.querySelector('dialog[open]')
    ) {
      return
    }
    // Disable immediately, before the asynchronous game loop applies the move.
    setTurn(false)
    onColumnSelected(column)
  }

  const handleControlClick = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement
    playColumn(Number(button.dataset.column))
  }
  const handleKeydown = (event: KeyboardEvent) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.repeat ||
      !isYourTurn ||
      document.querySelector('dialog[open]') ||
      isTextInput(event.target) ||
      !/^[1-7]$/.test(event.key)
    ) {
      return
    }
    event.preventDefault()
    playColumn(Number(event.key) - 1)
  }

  gameControls?.classList.remove('hidden')
  setTurn(false)
  for (const control of controls) {
    control.addEventListener('click', handleControlClick)
  }
  document.addEventListener('keydown', handleKeydown)
  for (const dialog of dialogs) {
    dialog.addEventListener('close', focusStart)
  }

  return {
    setTurn,
    playColumn,
    dispose() {
      setTurn(false)
      disposed = true
      gameControls?.classList.add('hidden')
      for (const control of controls) {
        control.removeEventListener('click', handleControlClick)
      }
      document.removeEventListener('keydown', handleKeydown)
      for (const dialog of dialogs) {
        dialog.removeEventListener('close', focusStart)
      }
    },
  }
}
