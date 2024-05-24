import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
  Spinner,
} from '@nextui-org/react'
import { useEffect, useMemo, useState } from 'react'

import {
  StatusBlock,
} from '~/components/status-block'

import {
  LOG_MEAN_LESS_NAME,
  LOG_NAME,
} from '~/utils/constants'

import type { LogData } from '~/types/sse'
import type { Source } from '~/types/plan'
import type { Status } from '~/types/log'

export function LogMessageCard({
  logDataList,
  source,
}: {
  logDataList: LogData[]
  source: Source
}) {
  const [status, setStatus] = useState<Status>('pending')
  const [showLogDetail, setShowLogDetail] = useState(false)

  useEffect(() => {
    const isDone = logDataList.some(logData => logData.message.name === LOG_NAME.TASK_END)
    const isStart = logDataList.some(logData => logData.message.name === LOG_NAME.TASK_START)
    const isFail = logDataList.some(logData => logData.message.name === LOG_NAME.TASK_ERROR)
    let _status = 'pending' as Status
    if (isDone)
      _status = 'done'
    else if (isFail)
      _status = 'fail'
    else if (isStart)
      _status = 'progress'
    setStatus(_status)
  }, [logDataList])

  const renderContent = (message: LogData['message']) => {
    if (typeof message.content === 'object')
      return <p className="whitespace-pre-wrap">{JSON.stringify(message.content, null, 2)}</p>
    else
      return <p>{message.content}</p>
  }

  const showedLogDataList = useMemo(() => {
    return logDataList.filter(logData => !LOG_MEAN_LESS_NAME.includes(logData.message.name))
  }, [logDataList])

  return (
    <Card
      className="max-w-[400px] w-full mb-2 text-sm"
    >
      <CardHeader
        className="flex justify-between items-center"
      >
        <div className="mr-2">
          <StatusBlock status={status} />
        </div>
        <div className="text-lg font-bold">
          {source.name}
        </div>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setShowLogDetail(!showLogDetail)
          }}
        >
          {showLogDetail ? '隐藏' : '显示'}
          日志
        </Button>
      </CardHeader>
      <Divider />
      {
        showLogDetail
          ? (
            <CardBody>
              {
                showedLogDataList.map(logData => (
                  <div
                    key={logData.time}
                    className="pb-1 border-b-stone-600b border-b-1 mb-1"
                  >
                    <h3 className="font-bold mb-1">{logData.message.name}</h3>
                    {renderContent(logData.message)}
                    <p className="text-gray-500 mb-1">{logData.time}</p>
                  </div>
                ))
              }
            </CardBody>
            )
          : null
      }
      <Divider />
      {
        logDataList && logDataList.length > 0
          ? (
            <CardFooter>
              <Link
                showAnchorIcon
                href={
                  logDataList[0].message.key
                }
                color="foreground"
                target="_blank"
                size="sm"
              >
                查看更多
              </Link>
            </CardFooter>
            )
          : null
      }
    </Card>
  )
}
