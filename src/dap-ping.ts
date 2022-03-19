import { randomBytes } from 'crypto'
import { performance } from 'perf_hooks'
import { createConnector } from './modules/dap'

const MESSAGES_COUNT = 1000
const MESSGAE_SIZE = 30 * 3

function randomPayload (): Promise<number[]> {
  return new Promise(resolve => {
    randomBytes(MESSGAE_SIZE, (_, buf) => {
      const payload = Array.from(buf)
      resolve(payload)
    })
  })
}

function calculateAverege (values: number[]): number {
  return values.reduce((acc, cur) => acc + cur, 0) / values.length
}

function calculateErrors (success: number) {
  return (100 - Math.floor(success / MESSAGES_COUNT)) * 100
}

async function main () {
  console.log('Connecting')
  const connection = await createConnector('/dev/ttyUSB0')
  let count = 0
  let successCount = 0
  let startTime = 0
  const time: number[] = []
  const payload = await randomPayload()
  console.log(`Transmitting ${MESSAGES_COUNT} messages with`)
  console.log(payload)
  while (count < MESSAGES_COUNT) {
    startTime = performance.now()
    const result = await connection.send(payload)
    time.push(performance.now() - startTime)
    if (result) {
      successCount++
    }
    count++
  }
  connection.destroy()
  const averageTime = calculateAverege(time).toFixed(2)
  const errorPercent = calculateErrors(successCount).toFixed(1)
  console.log([
    `${successCount} messages received`,
    `${errorPercent}% message loss`
  ].join(', '))
  console.log(`Average request time is ${averageTime} ms`)
}

main()
