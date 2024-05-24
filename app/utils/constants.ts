import dayjs from 'dayjs'
import type { Duration } from '../types/plan'

export const LANGUAGE_MAP = {
  zh: '中文',
  en: '英文',
}

export function buildHTML(content: string, title?: string) {
  return `<!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body>
    ${content}
  </body>
  </html>`
}

export const DEFAULT_DURATION: Duration = {
  start: dayjs().subtract(1, 'day').startOf('d').valueOf(),
  end: dayjs().valueOf(),
}

export const LOG_NAME = {
  PLAN_START: 'plan-start',
  PLAN_END: 'plan-end',
  SOURCE: 'source',
  TASK_START: 'task-start',
  TASK_END: 'task-end',
  TASK_ERROR: 'task-error',
}

export const LOG_MEAN_LESS_NAME = [
  LOG_NAME.PLAN_START,
  LOG_NAME.SOURCE,
  LOG_NAME.TASK_START,
]
