import { QUEUE_LOG_EVT_NAME, emitter } from '~/services/utils/event'

import type { LogData } from '~/types/sse'

import {
  LOG_NAME,
} from '~/utils/constants'

export function sendLog({
  type,
  message,
}: Omit<LogData, 'time'>) {
  emitter.emit(QUEUE_LOG_EVT_NAME, JSON.stringify({
    type,
    message,
    time: Date.now(),
  }))
}

export function createTaskStartLog(key: string) {
  sendLog({
    message: {
      content: LOG_NAME.TASK_START,
      name: LOG_NAME.TASK_START,
      key,
    },
    type: 'info',
  })
}

export function createTaskEndLog<T>(key: string, content?: T) {
  sendLog({
    message: {
      content: content || '任务结束',
      name: LOG_NAME.TASK_END,
      key,
    },
    type: 'info',
  })
}
export function createTaskErrorLog(key: string, content?: string) {
  sendLog({
    message: {
      content: content || LOG_NAME.TASK_ERROR,
      name: LOG_NAME.TASK_ERROR,
      key,
    },
    type: 'error',
  })
}
