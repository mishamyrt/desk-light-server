import { createLightClient } from './client'
import { LightTest } from './types'

export async function runTests (
  port: number,
  host: string,
  count: number,
  tests: LightTest[]
) {
  const client = await createLightClient(port, host)
  for (const test of tests) {
    console.log(`- Running ${test[0]} test`)
    await test[1]({
      client,
      count
    })
  }
  client.close()
}
