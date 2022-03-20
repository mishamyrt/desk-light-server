import { APP_PORT, APP_HOST } from './config'
import { createCommandServer } from './modules/server'
import { LightStrip } from './modules/light'
import { DapConnector, ConnectorMock, createConnector } from './modules/dap'
import { createLog } from './modules/log'

const { warn } = createLog('App')

const LIGHT_DEV = process.env.CONTROLLER_PATH

async function main () {
  let connector: DapConnector
  if (LIGHT_DEV) {
    connector = await createConnector(LIGHT_DEV)
  } else {
    warn('Using Dap device mock')
    connector = ConnectorMock
  }
  const device = new LightStrip(connector)
  await device.powerOn()
  createCommandServer(APP_PORT, APP_HOST)
    .on('power_on', () => device.powerOn())
    .on('power_off', () => device.powerOff())
    .on('set_color', args => device.setColor(
      args.slice(1),
      args[0]
    ))
    .on('set_color_zones', args => device.setColorZones(args))
    .on('get_props', () => device.getProperties())
    .on('send_raw', args => device.sendRaw(args))
}

main()
