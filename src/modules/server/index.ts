import { createSocket, RemoteInfo, Socket } from 'dgram'
import { Command, CommandHandler } from './types'
import { createLog } from '../log'

const { warn, debug, err } = createLog('UDP command server')

class CommandServer {
  private handlers: Record<string, CommandHandler> = {}
  private server: Socket

  constructor (port: number, host: string) {
    this.server = createSocket('udp4')
    this.server
      .on('message', (msg, info) => this.handleMessage(msg, info))
      .on('listening', () => {
        warn(`Command server running on ${host}:${port}`)
      })
      .on('close', () => {
        warn('Bye')
      })
      .bind(port, host)
  }

  public on (command: string, handler: CommandHandler) {
    this.handlers[command] = handler
    return this
  }

  private sendMessage (data: Record<string, unknown>, client: RemoteInfo): Promise<void> {
    debug('sendMessage')
    return new Promise(resolve => {
      const payload = JSON.stringify(data)
      debug(`Sending message to ${client.address}:${client.port}`, data)
      this.server.send(payload, client.port, client.address, error => {
        if (error) {
          err('Sending error', error)
        }
        debug('Message sent with', payload)
        resolve()
      })
    })
  }

  private async handleMessage (data: Buffer, client: RemoteInfo) {
    debug(`Got message from ${client.address}:${client.port}. Content: ${data.toString()}`)
    let command: Command
    try {
      command = JSON.parse(data.toString()) as Command
    } catch (e) {
      err('Command parsing error', e)
      return this.sendMessage({
        status: 'error',
        message: `${e}`
      }, client)
    }

    if (command.cmd in this.handlers) {
      const args = command.args || []
      debug(`Running handler for ${command.cmd}`)
      const result = await this.handlers[command.cmd](args)
      if (!result) return
      return this.sendMessage(result, client)
    }
    return this.sendMessage({
      status: 'error',
      message: `Unknown command ${command.cmd}`
    }, client)
  }
}

export function createCommandServer (port: number, host: string) {
  return new CommandServer(port, host)
}
