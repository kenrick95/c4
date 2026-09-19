export type MessageOptions = {
  title: string
  messages?: Array<string>
  render?: (content: HTMLElement) => void
}

export function showMessage({
  title,
  messages = [],
  render,
}: MessageOptions): HTMLDialogElement | undefined {
  const messageDOM: HTMLDialogElement | null =
    document.querySelector('.message-body')
  if (!messageDOM) {
    console.error('.message-body not found')
    return undefined
  }
  const messageContentDOM: HTMLDivElement | null = document.querySelector(
    '.message-body-content',
  )
  if (!messageContentDOM) {
    console.error('.message-body-content not found')
    return undefined
  }

  if (messageDOM.hasAttribute('open')) {
    messageDOM.close()
  }
  const heading = document.createElement('h2')
  heading.id = 'message-title'
  heading.textContent = title
  messageContentDOM.replaceChildren(heading)
  for (const message of messages) {
    const paragraph = document.createElement('p')
    paragraph.textContent = message
    messageContentDOM.append(paragraph)
  }
  render?.(messageContentDOM)
  messageDOM.showModal()
  return messageDOM
}
