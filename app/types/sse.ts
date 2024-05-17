export type LogType = 'info' | 'error' | 'warn'

export interface LogData {
  type: LogType
  message: {
    name: string
    content: any
    key?: string
  }
  time: number
}
