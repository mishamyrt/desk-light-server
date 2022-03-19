export interface DapConnector {
  send: (payload: number[]) => Promise<boolean>
  destroy: () => void
}
