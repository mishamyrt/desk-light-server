import { Command } from '../../src/modules/server/types'
import { sleep } from '../../src/modules/flow'
import { createSocket, Socket } from 'dgram'

export class LightClient {
  private response: string = ''
  private socket: Socket

  constructor (
    private readonly port: number,
    private readonly host: string
  ) {
    this.socket = createSocket('udp4')
    this.socket.on('message', data => {
      this.response = data.toString()
    })
  }

  public send (c: Command): Promise<void> {
    return new Promise(resolve => {
      this.socket.send(
        JSON.stringify(c),
        this.port,
        this.host,
        () => resolve()
      )
    })
  }

  public sleep (ms: number) {
    return sleep(ms)
  }

  public async read (): Promise<Record<string, any>> {
    while (true) {
      if (this.response === '') {
        await sleep(5)
        continue
      }
      const response = this.response
      this.response = ''
      return JSON.parse(response)
    }
  }
}

// function createSocket (port: number, host: string): Promise<Socket> {
//   return new Promise((resolve) => {
//     const client = new Socket()
//     client.connect(port, host, () => resolve(client))
//   })
// }

export async function createLightClient (
  port: number,
  host: string
): Promise<LightClient> {
  // const client = await createSocket(port, host)
  return new LightClient(port, host)
}
