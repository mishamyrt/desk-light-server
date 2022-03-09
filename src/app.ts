import { COMMANDS_PORT, HOST, LIGHT_DEV } from './config'
import { createCommandServer } from './modules/server'
import { LightStrip } from './modules/light'

async function createApp () {
  const device = new LightStrip(LIGHT_DEV)
  await device.ready()
  createCommandServer(COMMANDS_PORT, HOST)
    .on('power_on', () => device.setPower(true))
    .on('power_off', () => device.setPower(false))
    .on('set_color', args => device.setColor(...args as [number, number, number]))
    .on('set_brightness', args => device.setBrightness(args[0]))
}

createApp()
