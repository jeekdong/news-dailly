import {
  Button,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from '@nextui-org/react'
import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { LogMessageList, ResultMessage } from '~/components/log-message-list'

import { useLogFormatEventSource } from '~/utils/hooks'

import type {
  InfoItem,
} from '~/types/plan'

export default function Sse() {
  const {
    sourceData,
    sourceLogData,
    resultLogData,
  } = useLogFormatEventSource('/api/sse')

  const startPlanFetcher = useFetcher()

  useEffect(() => {
    if (startPlanFetcher.data) {
      toast.success('开始解析', {
        position: 'top-center',
      })
    }
  }, [startPlanFetcher.data])

  const tabs = sourceData?.map((data, index) => ({
    id: data.url,
    label: data.name,
    content: (
      <LogMessageList list={sourceLogData[index] || []} />
    ),
  }))

  return (
    <div className="w-full p-4">
      <startPlanFetcher.Form
        method="POST"
        action="/api/plan/start"
      >
        <div className="flex items-center justify-center">
          <Select
            name="period"
            className="w-64"
            label="解析周期"
            required
          >
            <SelectItem
              key="day"
              value="day"
            >
              每日
            </SelectItem>
            <SelectItem
              key="week"
              value="week"
            >
              每周
            </SelectItem>
            <SelectItem
              key="month"
              value="month"
            >
              每月
            </SelectItem>
          </Select>
          <Button
            color="primary"
            isLoading={startPlanFetcher.state === 'submitting'}
            type="submit"
          >
            开始解析
          </Button>
        </div>
      </startPlanFetcher.Form>
      <Tabs aria-label="source log data" items={tabs}>
        {item => (
          <Tab key={item.id} title={item.label}>
            {item.content}
          </Tab>
        )}
      </Tabs>
      {resultLogData && (
        resultLogData.message?.content.map((item: InfoItem) => (
          <ResultMessage
            data={item}
            key={item.url}
          />
        ))
      )}
    </div>
  )
}
