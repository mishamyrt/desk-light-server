import { LightTest } from '../runner'

const test: LightTest = ['power', async ({ count, client }) => {
  for (let i = 0; i < count; i++) {
    console.log('Disable light')
    await client.send({
      cmd: 'power_off'
    })
    await client.sleep(500)
    console.log('Enable light')
    await client.send({
      cmd: 'power_on'
    })
    await client.sleep(1000)
  }
}]

export default test
