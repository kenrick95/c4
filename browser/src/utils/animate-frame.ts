/**
 * @see https://esdiscuss.org/topic/promises-async-functions-and-requestanimationframe-together
 */
export function animationFrame(): Promise<number> {
  let resolve: null | FrameRequestCallback = null
  const promise = new Promise((r: FrameRequestCallback) => (resolve = r))

  if (resolve) window.requestAnimationFrame(resolve)

  return promise
}
