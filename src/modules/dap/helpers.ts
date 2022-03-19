export function calculateChecksum (message: number[]): number {
  let counter = 0
  for (const value of message) {
    counter += value
    if (counter > 255) {
      counter -= 255
    }
  }
  return counter
}

export function sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
