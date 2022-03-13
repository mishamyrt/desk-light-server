import { Socket } from 'net'
import { Command } from '../../src/modules/server/types'
import { sleep } from '../../src/modules/flow'

export class LightClient {
  private response: string = ''

  constructor (
    private socket: Socket
  ) {
    this.socket.on('data', data => {
      this.response = data.toString()
    })
  }

  public async send (c: Command) {
    this.socket.write(JSON.stringify(c))
    sleep(10)
  }

  public sleep (ms: number) {
    return sleep(ms)
  }

  public close () {
    this.socket.destroy()
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

function createSocket (port: number, host: string): Promise<Socket> {
  return new Promise((resolve) => {
    const client = new Socket()
    client.connect(port, host, () => resolve(client))
  })
}

export async function createLightClient (
  port: number,
  host: string
): Promise<LightClient> {
  const client = await createSocket(port, host)
  return new LightClient(client)
}
