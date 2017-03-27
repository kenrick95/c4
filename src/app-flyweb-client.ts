import * as Game from './game';
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.mode').classList.add('hidden')
  Game.initGameFlyweb({ clientMode: true })
})
