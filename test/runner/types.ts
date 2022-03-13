import { LightClient } from './client'

interface TestArguments {
  count: number
  client: LightClient
}

export type LightTest = [string, (args: TestArguments) => Promise<void>]
