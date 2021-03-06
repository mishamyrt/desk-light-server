import { SerialPort } from 'serialport'
import { Mutex } from 'async-mutex'
import { PassThrough } from 'stream'
import { calculateChecksum, sleep } from './helpers'
import { DapConnector } from './types'
import {
  BAUD_RATE,
  MESSAGE_HEADER,
  CODE_SUCCESS,
  CODE_ERROR
} from './constants'
import { createLog } from '../log'

const { log, debug } = createLog('Dap')

export class Connector implements DapConnector {
  private serial: SerialPort
  private stream: PassThrough
  private buffer: number[] = []
  private messages: number[][] = []
  private isProcessing = true
  private isReady = false
  private mutex = new Mutex()

  constructor (
    private readonly path: string
  ) {
    this.serial = new SerialPort({
      path,
      baudRate: BAUD_RATE
    })
    this.stream = new PassThrough()
      .on('data', (chunk: Buffer) => {
        debug('Got data', chunk)
        this.buffer.push(...chunk)
      })
    this.serial.pipe(this.stream)
    this.dataLoop()
  }

  public async ready () {
    if (this.isReady) {
      return
    }
    await this.getNextMessage()
    log(`Connected to Dap device on ${this.path}`)
    this.isReady = true
  }

  public async getNextMessage () {
    while (true) {
      if (this.messages.length === 0) {
        await sleep(1)
        continue
      }
      return this.messages.shift()!
    }
  }

  private async dataLoop () {
    while (this.isProcessing) {
      if (this.buffer.length === 0) {
        await sleep(1)
        continue
      }
      this.parseMessage()
    }
  }

  private parseMessage () {
    const isMessageFound = this.moveToMessage()
    if (!isMessageFound || this.buffer.length < 3) {
      debug('Valid message not found')
      return
    }
    const length = this.buffer.shift()
    if (!length || this.buffer.length < length + 1) {
      debug(`Wrong length ${length}`)
      return
    }
    const message: number[] = []
    for (let i = 0; i < length; i++) {
      const value = this.buffer.shift()
      if (!Number.isInteger(value)) {
        debug('Not enough symbols to parse message header')
        return
      }
      message.push(value!)
    }
    const actualCRC = this.buffer.shift()
    const expectedCRC = calculateChecksum(message)
    if (!Number.isInteger(actualCRC) || expectedCRC !== actualCRC) {
      debug(`Wrong checksum. Expected ${expectedCRC}, actual ${actualCRC}`)
      return
    }
    debug('Parsed message', message)
    this.messages.push(message)
  }

  private moveToMessage (): boolean {
    let looksLikeMessage = false
    while (this.buffer.length) {
      const value = this.buffer.shift()
      switch (value) {
        case MESSAGE_HEADER[0]:
          looksLikeMessage = true
          break
        case MESSAGE_HEADER[1]:
          if (looksLikeMessage) {
            return true
          }
          break
        default:
          looksLikeMessage = false
          break
      }
    }
    return false
  }

  public async send (message: number[]) {
    return this.mutex.runExclusive(() => this.sendMessage(message))
  }

  private async sendMessage (message: number[]): Promise<boolean> {
    const data = Buffer.from([
      ...MESSAGE_HEADER,
      message.length,
      ...message,
      calculateChecksum(message)
    ])
    debug('Writing', [...data])
    this.serial.write(data)
    const result = await this.getNextMessage()
    switch (result[0]) {
      case CODE_SUCCESS:
        return true
      case CODE_ERROR:
        return false
      default:
        throw new Error(`Unknown return code ${result[0]}. Payload ${message}`)
    }
  }

  public destroy () {
    this.isProcessing = false
    this.serial.close()
    this.stream.destroy()
  }
}

export async function createConnector (path: string): Promise<DapConnector> {
  const connector = new Connector(path)
  await connector.ready()
  return connector
}
