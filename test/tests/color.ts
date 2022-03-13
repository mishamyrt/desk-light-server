import { randomRGB } from '../helpers'
import { LightTest } from '../runner'

const test: LightTest = ['color', async ({ count, client }) => {
  for (let i = 0; i < count; i++) {
    const color = randomRGB()
    console.log('Writing color', `rgb(${color.join(', ')})`)
    await client.send({
      command: 'set_color',
      args: color
    })
    await client.sleep(1000)
  }
}]

export default test
