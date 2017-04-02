import * as Game from './game';
import { Board } from './board';
document.addEventListener('DOMContentLoaded', () => {
  const board = new Board(document.querySelector('canvas'))
  board.render()

  if (!('publishServer' in navigator)) {
    document.querySelector('.mode-chooser-input-flyweb').setAttribute('disabled', 'disabled')
  }

  document.querySelector('.mode-chooser-submit').addEventListener('click', () => {
    const modeDOM = document.querySelector('.mode')
    const modeInputDOMs = <NodeListOf<HTMLInputElement>>document.querySelectorAll('.mode-chooser-input')
    let chosenMode = null
    for (let i = 0; i < modeInputDOMs.length; i++) {
      chosenMode = modeInputDOMs[i].checked ? modeInputDOMs[i].value : null
      if (chosenMode) {
        break
      }
    }
    if (!chosenMode) {
      chosenMode = 'offline-ai'
    }
    if (chosenMode === 'offline-human') {
      Game.initGameLocal2p()
    } else if (chosenMode === 'local-flyweb') {
      Game.initGameFlyweb({ clientMode: false })
    } else if (chosenMode === 'offline-ai') {
      Game.initGameLocalAi()
    }

    modeDOM.classList.add('invisible')
    modeDOM.addEventListener('transitionend', () => {
      modeDOM.classList.add('hidden')
    })
  })
})
