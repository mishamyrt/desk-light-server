import { randomByte } from '../helpers'
import { LightTest } from '../runner'

const test: LightTest = ['brightness', async ({ count, client }) => {
  for (let i = 0; i < count; i++) {
    const brightness = randomByte()
    console.log(`Setting brightness to ${brightness}`)
    await client.send({
      command: 'set_brightness',
      args: [randomByte()]
    })
    await client.sleep(1000)
  }
}]

export default test
