export type Task = () => Promise<any>

export interface Zone {
  start: number
  length: number
}
