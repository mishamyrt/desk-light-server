import { basename } from 'path'
import { stderr, stdout, env } from 'process'
import { format } from 'util'

type IOWriteStream = typeof stdout | typeof stderr

enum Color {
  Reset = '\x1b[0m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Grey = '\x1b[2m',
  Blue = '\x1b[34m'
}

const PATH_DELIMETER = ': '

/**
 * Formats current timestamp
 */
function formatISO () {
  return new Date().toISOString()
}

/**
 * Creates colored logger
 */
function createLogger (path: string[], stream: IOWriteStream, color = Color.Reset) {
  return function (...args: any[]) {
    if (process.env.APP_SILENT) return
    const prefix = path.join(PATH_DELIMETER) + PATH_DELIMETER
    const message =
      Color.Grey +
      formatISO() + ' ' +
      Color.Reset +
      Color.Blue +
      prefix +
      color +
      format(...args) +
      Color.Reset
    stream.write(message + '\n')
  }
}

/**
 * Creates loggers
 */
export function createLoggers (path: string[]) {
  return {
    log: createLogger(path, stdout),
    warn: createLogger(path, stdout, Color.Yellow),
    err: createLogger(path, stderr, Color.Red),
    debug: env.NODE_ENV === 'dev'
      ? createLogger([...path, 'debug'], stdout, Color.Yellow)
      // This function should be valid replacement for log function
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      : (...args: any[]) => {},
    createSubLog: (subtitle: string) => createLoggers([...path, subtitle])
  }
}

/**
 * Creates file loggers
 */
export function createLog (path: string) {
  const name = basename(path, '.js')
  return createLoggers([name])
}
