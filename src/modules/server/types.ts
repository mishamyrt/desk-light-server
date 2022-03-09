export type CommandHandler = (args: number[]) => Promise<void>
export type CommandTask = [CommandHandler, number[]]

export interface Command {
  command: string,
  args?: number[]
}
