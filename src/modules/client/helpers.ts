export function objectFromBuffer (buffer: Buffer): Record<string, any> {
  return JSON.parse(
    buffer.toString()
  )
}

export function objectToBuffer (object: Record<string, any>): Buffer {
  return Buffer.from(
    JSON.stringify(object)
  )
}
