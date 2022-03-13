import { isSameColors, randomByte, randomRGB } from '../helpers'
import { LightTest } from '../runner'

const test: LightTest = ['state', async ({ count, client }) => {
  for (let i = 0; i < count; i++) {
    const brightness = randomByte()
    const color = randomRGB()
    await client.send({
      command: 'power_on'
    })
    await client.send({
      command: 'set_brightness',
      args: [brightness]
    })
    await client.sleep(1000)
    await client.send({
      command: 'set_color',
      args: color
    })
    await client.sleep(500)
    await client.send({ command: 'get_properties' })
    const response = await client.read()
    if (response.state &&
        brightness === response.brightness &&
        isSameColors(color, response.color)) {
      console.log('Success')
      console.log(`Color rgb(${response.color}), brightness ${response.brightness}`)
    } else {
      console.log('Error')
      console.log('Exprected:', color, 'actual:', response.color)
      console.log('Exprected:', brightness, 'actual:', response.brightness)
    }
  }
}]

export default test
