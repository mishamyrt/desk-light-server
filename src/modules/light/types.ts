export type Task = () => Promise<void>

export interface Zone {
  start: number
  length: number
}
