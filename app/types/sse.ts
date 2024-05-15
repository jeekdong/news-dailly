export type LogType = 'info' | 'error' | 'warn'


export interface LogData {
  type: LogType,
  message: string,
  time: number
}