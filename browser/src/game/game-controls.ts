const gameControls = document.querySelector('.game-controls')

function isTextInput(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
  )
}

export function activateGameControls(onColumnSelected: (column: number) => void) {
  const controls = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.game-control'),
  )

  const handleControlClick = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement
    onColumnSelected(Number(button.dataset.column))
  }
  const handleKeydown = (event: KeyboardEvent) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      isTextInput(event.target) ||
      !/^[1-7]$/.test(event.key)
    ) {
      return
    }
    event.preventDefault()
    onColumnSelected(Number(event.key) - 1)
  }

  gameControls?.classList.remove('hidden')
  for (const control of controls) {
    control.addEventListener('click', handleControlClick)
  }
  document.addEventListener('keydown', handleKeydown)

  return () => {
    gameControls?.classList.add('hidden')
    for (const control of controls) {
      control.removeEventListener('click', handleControlClick)
    }
    document.removeEventListener('keydown', handleKeydown)
  }
}
