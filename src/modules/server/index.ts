import { createSocket, RemoteInfo, Socket } from 'dgram'
import { Command, CommandHandler } from './types'

class CommandServer {
  private handlers: Record<string, CommandHandler> = {}
  private server: Socket

  constructor (port: number, host: string) {
    this.server = createSocket('udp4')
    this.server
      .on('message', (msg, info) => this.handleMessage(msg, info))
      .on('listening', () => {
        console.log(`Command server running on ${host}:${port}`)
      })
      .bind(port, host)
  }

  public on (command: string, handler: CommandHandler) {
    this.handlers[command] = handler
    return this
  }

  private sendMessage (data: Record<string, unknown>, client: RemoteInfo): Promise<void> {
    return new Promise(resolve => {
      this.server.send(Buffer.from(JSON.stringify(data)), client.port, client.address, (e) => {
        if (e) {
          console.log('Send error', e)
        }
        resolve()
      })
    })
  }

  private async handleMessage (data: Buffer, client: RemoteInfo) {
    let command: Command
    try {
      command = JSON.parse(data.toString()) as Command
    } catch (e) {
      console.error('Command parsing error', e)
      return this.sendMessage({
        status: 'error',
        message: `${e}`
      }, client)
    }

    if (command.cmd in this.handlers) {
      const args = command.args || []
      const result = await this.handlers[command.cmd](args)
      if (!result) return
      return this.sendMessage(result, client)
    }
    return this.sendMessage({
      status: 'error',
      message: 'Unknown command'
    }, client)
  }
}

export function createCommandServer (port: number, host: string) {
  return new CommandServer(port, host)
}
