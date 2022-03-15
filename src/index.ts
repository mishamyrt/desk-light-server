import { COMMANDS_PORT, HOST, LIGHT_DEV } from './config'
import { createCommandServer } from './modules/server'
import { LightStrip } from './modules/light'

async function main () {
  const device = new LightStrip(LIGHT_DEV)
  await device.ready()
  device.setPower(true)
  createCommandServer(COMMANDS_PORT, HOST)
    .on('power_on', () => device.setPower(true))
    .on('power_off', () => device.setPower(false))
    .on('set_color', args => device.setColor(...args as [number, number, number]))
    .on('set_brightness', args => device.setBrightness(args[0]))
    .on('start_ambilight', args => device.startAmbilight(args))
    .on('stop_animation', () => device.stopAnimation())
    .on('set_ambilight_color', args => device.setAmbilightColor(args))
    .on('get_props', () => device.getProperties())
}

main()
