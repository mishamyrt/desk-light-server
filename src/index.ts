import { COMMANDS_PORT, HOST } from './config'
import { createCommandServer } from './modules/server'
import { LightStrip } from './modules/light'
import { DapConnector, ConnectorMock, createConnector } from './modules/dap'

const LIGHT_DEV = process.env.CONTROLLER_PATH

async function main () {
  let connector: DapConnector
  if (LIGHT_DEV) {
    connector = await createConnector(LIGHT_DEV)
  } else {
    console.log('Using mock')
    connector = ConnectorMock
  }
  const device = new LightStrip(connector)
  await device.powerOn()
  createCommandServer(COMMANDS_PORT, HOST)
    .on('power_on', () => device.powerOn())
    .on('power_off', () => device.powerOff())
    .on('set_color', (args) => device.setColor(
      [
        args[0], // R
        args[1], // G
        args[2] //  B
      ],
      args[3] // Brightness
    ))
    .on('get_props', () => device.getProperties())
}

main()
