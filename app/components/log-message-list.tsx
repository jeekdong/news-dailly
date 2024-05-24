import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link,
} from '@nextui-org/react'

import type { LogData } from '~/types/sse'

import type {
  InfoItem,
} from '~/types/plan'

import {
  LOG_NAME,
} from '~/utils/constants'

interface LogMessageListProps {
  list: LogData[]
}

interface LogMessageProps {
  message: LogData['message']
}

interface ResultMessageProps {
  data: InfoItem
}

export function ResultMessage({
  data,
}: ResultMessageProps) {
  return (
    <Card className="max-w-[800px] w-full mb-2 text-sm">
      <CardHeader>
        {data.name}
      </CardHeader>
      <CardBody>
        {
          data.items.length
            ? (
              <>
                {
                data.items.map((item, index) => (
                  <div key={index}>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="whitespace-pre-wrap mb-1">{item.content}</p>
                    <p className="text-gray-500 mb-1">{item.date}</p>
                  </div>
                ))
              }
              </>
              )
            : (
              <p>暂无数据</p>
              )
        }
      </CardBody>
      <CardFooter>
        <Link
          showAnchorIcon
          href={
            data.url
          }
          color="foreground"
          target="_blank"
        >
          查看更多
        </Link>
      </CardFooter>
    </Card>
  )
}

export function LogMessage({
  message,
}: LogMessageProps) {
  if (message.name === LOG_NAME.PLAN_END) {
    return message.content.map((item: InfoItem) => (
      <ResultMessage
        data={item}
        key={item.url}
      />
    ))
  }

  const renderContent = () => {
    if (typeof message.content === 'object')
      return <p className="whitespace-pre-wrap">{JSON.stringify(message.content, null, 2)}</p>
    else
      return <p>{message.content}</p>
  }
  return (
    <Card
      className="max-w-[800px] w-full mb-2 text-sm"
    >
      <CardHeader>
        {message.name}
      </CardHeader>
      <CardBody>
        {renderContent()}
      </CardBody>
    </Card>
  )
}

export function LogMessageList({
  list,
}: LogMessageListProps) {
  return (
    <div className="flex flex-col items-center">
      {
        list.map(item => (
          <LogMessage
            message={item.message}
            key={item.time}
          />
        ))
      }
    </div>
  )
}
