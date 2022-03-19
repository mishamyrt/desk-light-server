import { createSocket, Socket } from 'dgram'
import { objectFromBuffer, objectToBuffer } from './helpers'
import { Command } from '../server/types'
import { createLog } from '../log'
import { APP_PORT } from '../../config'
import { Mutex } from 'async-mutex'
import { sleep } from '../dap/helpers'

const { err } = createLog('UDP command client')

class CommandClient {
  private readonly socket: Socket
  private unreadMessage: Record<string, any> | null = null
  private isReady = false
  private mutex = new Mutex()

  constructor (
    private readonly host: string
  ) {
    this.socket = createSocket('udp4')
    this.socket
      .on('message', message => {
        this.unreadMessage = objectFromBuffer(message)
      })
      .on('listening', () => {
        this.isReady = true
      })
      .bind()
  }

  public async ready () {
    while (!this.isReady) {
      await sleep(1)
    }
  }

  public send (cmd: Command) {
    return this.mutex.runExclusive(() => this.sendCommand(cmd))
  }

  public async close (): Promise<void> {
    return new Promise(resolve => {
      this.socket.close(resolve)
    })
  }

  private async sendCommand (cmd: Command) {
    this.socket.send(
      objectToBuffer(cmd),
      APP_PORT,
      this.host,
      (error) => {
        if (!error) return
        err(`Error while sending message: ${error}`)
      }
    )
    return this.readMessage()
  }

  private async readMessage () {
    while (!this.unreadMessage) {
      await sleep(1)
    }
    const message = { ...this.unreadMessage }
    this.unreadMessage = null
    return message
  }
}

export async function createClient (host: string) {
  const sender = new CommandClient(host)
  await sender.ready()
  return sender
}
