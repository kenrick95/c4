import * as Game from './game'
import { Board } from './board'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('.section-canvas') as HTMLCanvasElement

  if (!canvas) {
    console.error('Canvas element not found')
    return
  }
  const initScreenDOM = document.querySelector(
    '.init-screen',
  ) as HTMLDialogElement
  if (!initScreenDOM) {
    console.error('Mode element not found ')
    return
  }
  const board = new Board(canvas)
  board.render()

  const searchParams = new URLSearchParams(location.search)
  const connectionMatchId = searchParams.get('matchId')
  const backToModeSelector = document.querySelector(
    '.statusbox-button-back',
  ) as HTMLDivElement

  const settingsForm = document.querySelector(
    '.game-settings-form',
  ) as HTMLFormElement

  if (!settingsForm) {
    console.error('.game-settings-form not found ')
    return
  }

  const player1NameLabel = settingsForm.querySelector(
    '.game-settings-player-1-name-label',
  ) as HTMLLabelElement
  const player2NameLabel = settingsForm.querySelector(
    '.game-settings-player-2-name-label',
  ) as HTMLLabelElement
  const player1NameInput = settingsForm.querySelector(
    '.game-settings-player-1-name-input',
  ) as HTMLInputElement
  const player2NameInput = settingsForm.querySelector(
    '.game-settings-player-2-name-input',
  ) as HTMLInputElement

  let currentGameHandler:
    | {
        end: () => void
      }
    | undefined
    | null = null

  backToModeSelector?.classList.add('hidden')
  initScreenDOM.showModal()

  let chosenMode: string = !!connectionMatchId ? 'online-human' : 'offline-ai'
  renderForm()

  backToModeSelector?.addEventListener('click', () => {
    if (currentGameHandler && currentGameHandler.end) {
      currentGameHandler.end()
    }
    backToModeSelector?.classList.add('hidden')
    initScreenDOM.showModal()
  })

  initScreenDOM.addEventListener('cancel', (ev) => {
    ev.preventDefault()
  })

  initScreenDOM.addEventListener('close', (ev) => {
    const formData = new FormData(settingsForm)
    const gameMode = formData.get('mode') as string
    const firstPlayerName = formData.get('player-1-name') as string | null
    const secondPlayerName = formData.get('player-2-name') as string | null
    initGame(gameMode, [firstPlayerName, secondPlayerName])
  })

  settingsForm.addEventListener('input', (ev) => {
    const formData = new FormData(settingsForm)
    chosenMode = formData.get('mode') as string
    renderForm()
  })

  function renderForm() {
    if (!!connectionMatchId) {
      for (let el of settingsForm.querySelectorAll(
        '.game-settings-mode-input',
      )) {
        const checkboxEl = el as HTMLInputElement
        checkboxEl.readOnly = true
        if (checkboxEl.value === 'online-human') {
          checkboxEl.checked = true
        } else {
          checkboxEl.checked = false
        }
      }

      player2NameLabel.textContent = `Your name:`
      player1NameInput.disabled = true
      player2NameInput.disabled = false
      player1NameLabel.classList.add('hidden')
      player1NameInput.classList.add('hidden')
      player2NameLabel.classList.remove('hidden')
      player2NameInput.classList.remove('hidden')
    } else if (chosenMode === 'offline-human') {
      player1NameLabel.textContent = `First player's name:`
      player2NameLabel.textContent = `Second player's name:`
      player1NameLabel.classList.remove('hidden')
      player1NameInput.classList.remove('hidden')
      player2NameLabel.classList.remove('hidden')
      player2NameInput.classList.remove('hidden')
      player1NameInput.disabled = false
      player2NameInput.disabled = false
    } else if (chosenMode === 'offline-ai') {
      player1NameLabel.textContent = `Player's name:`
      player2NameLabel.textContent = `Player's name:`
      player1NameLabel.classList.remove('hidden')
      player1NameInput.classList.remove('hidden')
      player2NameLabel.classList.add('hidden')
      player2NameInput.classList.add('hidden')
      player1NameInput.disabled = false
      player2NameInput.disabled = true
    } else if (chosenMode === 'online-human') {
      player1NameLabel.textContent = `Your name:`
      player2NameLabel.textContent = `Other player's name:`
      player1NameLabel.classList.remove('hidden')
      player1NameInput.classList.remove('hidden')
      player2NameLabel.classList.add('hidden')
      player2NameInput.classList.add('hidden')
      player1NameInput.disabled = false
      player2NameInput.disabled = true
    } else if (chosenMode === 'ai-vs-ai') {
      player1NameLabel.textContent = `Player's name:`
      player2NameLabel.textContent = `Player's name:`
      player1NameLabel.classList.add('hidden')
      player1NameInput.classList.add('hidden')
      player2NameLabel.classList.add('hidden')
      player2NameInput.classList.add('hidden')
      player1NameInput.disabled = true
      player2NameInput.disabled = true
    }
  }

  function initGame(chosenMode: string | null, playerNames: (string | null)[]) {
    console.log('initGame chosenMode:', chosenMode)
    backToModeSelector?.classList.remove('hidden')
    if (chosenMode === 'offline-human') {
      currentGameHandler = Game.initGameLocal2p(
        playerNames[0] || 'Player 1',
        playerNames[1] || 'Player 2',
      )
    } else if (chosenMode === 'offline-ai') {
      currentGameHandler = Game.initGameLocalAi(playerNames[0] || 'Player 1')
    } else if (chosenMode === 'online-human') {
      currentGameHandler = Game.initGameOnline2p(
        connectionMatchId
          ? playerNames[1] || 'Player 2'
          : playerNames[0] || 'Player 1',
      )
    } else if (chosenMode === 'ai-vs-ai') {
      currentGameHandler = Game.initGameAiVsAi()
    } else {
      console.error('Invalid game mode received', chosenMode)
    }
  }
})
