import { Socket } from 'net'
import { COMMANDS_PORT, HOST } from './config'
import { sleep } from './modules/flow'
import { Command } from './modules/server/types'

function createClientSocket (): Promise<Socket> {
  return new Promise((resolve) => {
    const client = new Socket()
    client.connect(COMMANDS_PORT, HOST, () => resolve(client))
  })
}

async function createClient () {
  const client = await createClientSocket()
  function send (command: Command) {
    client.write(JSON.stringify(command))
  }
  return send
}

async function test () {
  const send = await createClient()
  send({
    command: 'power_on'
  })
  await sleep(1500)
  send({
    command: 'set_color',
    args: [255, 0, 0]
  })
}

test()
