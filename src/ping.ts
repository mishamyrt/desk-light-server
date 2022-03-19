import { performance } from 'perf_hooks'
import { argv } from 'process'
import { createClient } from './modules/client'
import { createLog } from './modules/log'

const REQUEST_COUNT = 1000
const { log, err } = createLog('Ping')

function averageValue (values: number[]): number {
  return values.reduce((sum, current) => sum + current, 0) / values.length
}

function calculateLoss (total: number, success: number) {
  return 100 - ((success / total) * 100)
}

async function main () {
  if (argv.length < 3) {
    err('No host address is given')
    log('Example: npm run ping -- 192.168.31.22')
    process.exit(1)
  }
  const host = argv[2]
  log('Creating a socket')
  const client = await createClient(host)
  const responseTime: number[] = []
  let response: any = {}
  let successCount = 0
  let startTime = 0
  log(`Sending ${REQUEST_COUNT} requests to ${host}`)
  for (let i = 0; i < REQUEST_COUNT; i++) {
    startTime = performance.now()
    response = await client.send({
      cmd: 'power_on',
      args: []
    })
    responseTime.push(performance.now() - startTime)
    if (response?.status === 'success') {
      successCount++
    }
  }
  await client.close()
  const averageTime = averageValue(responseTime).toFixed(2)
  const loss = calculateLoss(REQUEST_COUNT, successCount).toFixed(2)
  log(`Average request time ${averageTime} ms, ${loss}% request loss`)
}

main()
