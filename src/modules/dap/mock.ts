import { DapConnector } from './types'
import { sleep } from './helpers'

export const ConnectorMock: DapConnector = {
  send: async () => {
    await sleep(5)
    return true
  },
  destroy: () => {}
}
