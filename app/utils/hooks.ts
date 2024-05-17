import { useEffect, useRef, useState } from 'react'
import { useLatest } from 'react-use'

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

export function useLogFormatEventSource(
  url: string,
) {
  const [source] = useEventSource(url)

  const [logList, setLogList] = useState<LogData[]>([])
  const [sourceData, setSourceData] = useState<any[]>([])
  const [sourceLogData, setSourceLogData] = useState<any[]>([])
  const [globalLogData, setGlobalLogData] = useState<any[]>([])
  const [resultLogData, setResultLogData] = useState<any>()

  const latestSourceData = useLatest(sourceData)

  useEventSourceListener(source, ['message'], (evt) => {
    const data = JSON.parse(evt.data)
    if (data?.message?.name === 'source')
      setSourceData(data.message.content.feeds)
    if (data?.message?.name === 'plan-end')
      setResultLogData(data)

    if (data?.message?.key) {
      // 找到这个 key 在 sourceData 中的索引
      const index = latestSourceData.current.findIndex(item => item.url === data.message.key)
      if (index !== -1) {
        setSourceLogData((pre) => {
          const newPre = [...pre]
          newPre[index] = Array.isArray(newPre[index])
            ? [...newPre[index], data]
            : [data]
          return newPre
        })
      }
    }
    else {
      setGlobalLogData(pre => [...pre, data])
    }

    setLogList(pre => [...pre, data])
  }, [])

  const handleClear = () => {
    setLogList([])
    setSourceData([])
    setSourceLogData([])
    setGlobalLogData([])
    setResultLogData(undefined)
  }

  return {
    logList,
    sourceData,
    sourceLogData,
    globalLogData,
    resultLogData,
    handleClear,
  }
}
