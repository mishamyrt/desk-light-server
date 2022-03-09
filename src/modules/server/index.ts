import { createServer, Socket } from 'net'
import { Command, CommandHandler, CommandTask } from './types'

class CommandServer {
  private handlers: Record<string, CommandHandler> = {}
  private isBusy = false
  private tasks: CommandTask[] = []

  constructor (port: number, host: string) {
    createServer()
      .on('connection', client => this.handleNewClient(client))
      .on('data', data => this.handleData(data))
      .on('close', () => this.handleDisconnect())
      .on('error', () => this.handleDisconnect())
      .listen(port, host, () => {
        console.log(`Command server running on ${host}:${port}`)
      })
  }

  public on (command: string, handler: CommandHandler) {
    this.handlers[command] = handler
    return this
  }

  private handleNewClient (client: Socket) {
    if (this.isBusy) {
      client.write(JSON.stringify({
        error: 'There is a client already'
      }))
      client.end()
      return
    }
    client
      .on('data', data => this.handleData(data))
      .on('close', () => this.handleDisconnect())
      .on('error', () => this.handleDisconnect())
    this.isBusy = true
  }

  private handleDisconnect () {
    this.isBusy = false
  }

  private runScheduler () {

  }

  private handleData (data: Buffer) {
    const command = JSON.parse(data.toString()) as Command
    if (command.command in this.handlers) {
      const args = command.args || []
      this.handlers[command.command](args)
      // const args = command.args || []
      // this.tasks.push([
      //   this.handlers[command.command],
      //   args
      // ])
    }
  }
}

export function createCommandServer (port: number, host: string) {
  return new CommandServer(port, host)
}
