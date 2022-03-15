import { randomByte, randomRGB } from '../helpers'
import { LightTest } from '../runner'

const test: LightTest = ['color', async ({ count, client }) => {
  for (let i = 0; i < count; i++) {
    const color = randomRGB()
    const brightness = randomByte()
    console.log('Writing color', `rgb(${color.join(', ')}) with brightness ${brightness}`)
    await client.send({
      cmd: 'set_color',
      args: [...color, brightness]
    })
    await client.sleep(1000)
  }
}]

export default test
