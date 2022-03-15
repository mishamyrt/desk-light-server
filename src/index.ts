import { COMMANDS_PORT, HOST, LIGHT_DEV } from './config'
import { createCommandServer } from './modules/server'
import { LightStrip } from './modules/light'

async function main () {
  const device = new LightStrip(LIGHT_DEV)
  await device.ready()
  await device.powerOn()
  createCommandServer(COMMANDS_PORT, HOST)
    .on('power_on', () => device.powerOn())
    .on('power_off', () => device.powerOff())
    .on('set_color', args => device.setColor(...args as [number, number, number]))
    .on('set_brightness', args => device.setBrightness(args[0]))
    .on('start_ambilight', args => device.startAmbilight(args))
    .on('stop_animation', () => device.stopAnimation())
    .on('set_ambilight_color', args => device.setAmbilightColor(args))
    .on('get_props', () => device.getProperties())
}

main()
