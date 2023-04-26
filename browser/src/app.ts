import * as Game from './game'
import { Board } from './board'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('.section-canvas') as HTMLCanvasElement

  if (!canvas) {
    console.error('Canvas element not found')
    return
  }
  const modeDOM = document.querySelector('.mode-chooser') as HTMLDialogElement
  if (!modeDOM) {
    console.error('Mode element not found ')
    return
  }
  const board = new Board(canvas)
  board.render()

  const searchParams = new URLSearchParams(location.search)
  const connectionMatchId = searchParams.get('matchId')
  if (!!connectionMatchId) {
    Game.initGameOnline2p()
    return
  }
  modeDOM.showModal()

  const modeChooser = document.querySelector(
    '.mode-chooser-form'
  ) as HTMLFormElement

  if (!modeChooser) {
    console.error('.mode-chooser-form not found ')
    return
  }
  modeDOM.addEventListener('cancel', (ev) => {
    ev.preventDefault()
  })

  modeDOM.addEventListener('close', (ev) => {
    const formData = new FormData(modeChooser)
    initGame(formData.get('mode') as string)
  })

  function initGame(chosenMode: string | null) {
    console.log('initGame chosenMode:', chosenMode)
    if (chosenMode === 'offline-human') {
      Game.initGameLocal2p()
    } else if (chosenMode === 'offline-ai') {
      Game.initGameLocalAi()
    } else if (chosenMode === 'online-human') {
      Game.initGameOnline2p()
    } else if (chosenMode === 'ai-vs-ai') {
      Game.initGameAiVsAi()
    } else {
      console.error('Invalid game mode received', chosenMode)
    }
  }
})
