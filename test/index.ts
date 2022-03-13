import { COMMANDS_PORT } from '../src/config'
import { runTests } from './runner'
import {
  tests
} from './tests'

async function main () {
  await runTests(COMMANDS_PORT, '192.168.31.22', 3, tests)
}

main()
