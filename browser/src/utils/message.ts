export function showMessage(message: string = ''): void {
  const messageDOM: Element | null = document.querySelector('.message')

  if (!messageDOM) return console.error('Message DOM is null!')

  messageDOM.classList.remove('hidden')

  const messageContentDOM: Element | null = document.querySelector(
    '.message-body-content'
  )

  if (!messageContentDOM)
    return console.error('Message body content DOM is null!')

  messageContentDOM.innerHTML = message

  const messageDismissDOM: Element | null = document.querySelector(
    '.message-body-dismiss'
  )

  if (!messageDismissDOM)
    return console.error('Message body dismiss DOM is null!')

  const dismissHandler = (): void => {
    messageDOM.classList.add('invisible')
    messageDOM.addEventListener('transitionend', (): void => {
      messageDOM.classList.add('hidden')
      messageDOM.classList.remove('invisible')
    })

    messageDismissDOM.removeEventListener('click', dismissHandler)
  }

  messageDismissDOM.addEventListener('click', dismissHandler)
}
