import { useEffect, useRef, useState } from 'react'

import type { LogData } from '~/types/sse'

export type EventSourceStatus = 'init' | 'open' | 'closed' | 'error'

export type EventSourceEvent = Event & { data: string }

export function useEventSource(url: string, withCredentials?: boolean) {
  const source = useRef<EventSource | null>(null)
  const [status, setStatus] = useState<EventSourceStatus>('init')
  useEffect(() => {
    if (url) {
      const es = new EventSource(url, { withCredentials })
      source.current = es

      es.addEventListener('open', () => setStatus('open'))
      es.addEventListener('error', () => setStatus('error'))

      return () => {
        source.current = null
        es.close()
      }
    }

    setStatus('closed')

    return undefined
  }, [url, withCredentials])

  return [source.current, status] as const
}

export function useEventSourceListener(
  source: EventSource | null,
  types: string[],
  listener: (e: EventSourceEvent) => void,
  dependencies: any[] = [],
) {
  useEffect(() => {
    if (source) {
      types.forEach(type => source.addEventListener(type, listener as any))
      return () => types.forEach(type => source.removeEventListener(type, listener as any))
    }
    return undefined
  }, [source, ...dependencies])
}

export function useLogEventSource(
  url: string,
) {
  const [logList, setLogList] = useState<LogData[]>([])
  const [source] = useEventSource(url)

  useEventSourceListener(source, ['message'], (evt) => {
    setLogList(pre => [...pre, JSON.parse(evt.data)])
  }, [])

  return logList
}
