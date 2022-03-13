export type CommandHandler = (args: number[]) => Promise<void | Record<string, any>>
export type CommandTask = [CommandHandler, number[]]

export interface Command {
  cmd: string,
  args?: number[]
}
