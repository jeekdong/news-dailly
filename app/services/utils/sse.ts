import { QUEUE_LOG_EVT_NAME, emitter } from '~/services/utils/event'

import type { LogData } from '~/types/sse'

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
