import 'es6-promise/auto'
import 'url-search-params-polyfill'
import * as Game from './game'
import { Board } from './board'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas DOM is null')
    return
  }
  const board = new Board(canvas)
  board.render()

  const searchParams = new URLSearchParams(location.search)
  const connectionMatchId = searchParams.get('matchId')
  if (!!connectionMatchId) {
    Game.initGameOnline2p()
    const modeDOM = document.querySelector('.mode')
    if (modeDOM) {
      modeDOM.classList.add('hidden')
    }
  }

  const modeChooser = document.querySelector('.mode-chooser-submit')
  if (modeChooser) {
    modeChooser.addEventListener('click', () => {
      const modeDOM = document.querySelector('.mode')
      if (modeDOM) {
        const modeInputDOMs = <NodeListOf<HTMLInputElement>>(
          document.querySelectorAll('.mode-chooser-input')
        )
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
        } else if (chosenMode === 'offline-ai') {
          Game.initGameLocalAi()
        } else if (chosenMode === 'online-human') {
          Game.initGameOnline2p()
        }

        modeDOM.classList.add('invisible')
        modeDOM.addEventListener('transitionend', () => {
          modeDOM.classList.add('hidden')
        })
      }
    })
  }
})
