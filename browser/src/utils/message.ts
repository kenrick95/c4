export function showMessage(message: string = ''): void {
  const messageDOM: HTMLDialogElement | null =
    document.querySelector('.message-body')
  if (!messageDOM) {
    console.error('.message-body not found')
    return
  }
  const messageContentDOM: HTMLDivElement | null = document.querySelector(
    '.message-body-content'
  )
  if (!messageContentDOM) {
    console.error('.message-body-content not found')
    return
  }

  messageContentDOM.innerHTML = message
  messageDOM.showModal()
}
