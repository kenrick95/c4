import * as Game from './game'
document.addEventListener('DOMContentLoaded', () => {
  const modeDOM = document.querySelector('.mode')
  if (modeDOM) {
    modeDOM.classList.add('hidden')
  }
  Game.initGameFlyweb({ clientMode: true })
})
