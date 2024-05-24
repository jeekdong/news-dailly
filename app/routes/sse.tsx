import {
  Button,
  ButtonGroup,
  DateRangePicker,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from '@nextui-org/react'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getLocalTimeZone, today } from '@internationalized/date'

import { ClientOnly } from 'remix-utils/client-only'
import { LogMessageList, ResultMessage } from '~/components/log-message-list'
import { LogMessageCard } from '~/components/log-message-card'
import { ImageExport } from '~/components/image-export'

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

  const [duration, setDuration] = useState({
    start: today(getLocalTimeZone()).subtract({ days: 1 }),
    end: today(getLocalTimeZone()),
  })

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
        <div>
          <DateRangePicker
            startName="start"
            endName="end"
            label="解析时间"
            isRequired
            value={duration}
            onChange={value => setDuration(value)}
            className="w-full max-w-[400px]"
          />
          <div className="flex items-center justify-between w-full max-w-[400px]">
            <ButtonGroup>
              <Button
                color="secondary"
                onClick={() => {
                  setDuration({
                    start: today(getLocalTimeZone()).subtract({ days: 1 }),
                    end: today(getLocalTimeZone()),
                  })
                }}
              >
                昨日
              </Button>
              <Button
                color="secondary"
                onClick={() => {
                  setDuration({
                    start: today(getLocalTimeZone()).subtract({ days: 7 }),
                    end: today(getLocalTimeZone()),
                  })
                }}
              >
                最近一周
              </Button>
              <Button
                color="secondary"
                onClick={() => {
                  setDuration({
                    start: today(getLocalTimeZone()).subtract({ days: 30 }),
                    end: today(getLocalTimeZone()),
                  })
                }}
              >
                最近一月
              </Button>
            </ButtonGroup>
            <Button
              color="primary"
              isLoading={startPlanFetcher.state === 'submitting'}
              type="submit"
            >
              开始解析
            </Button>
          </div>
        </div>
      </startPlanFetcher.Form>
      {/* <Tabs aria-label="source log data" items={tabs}>
        {item => (
          <Tab key={item.id} title={item.label}>
            {item.content}
          </Tab>
        )}
      </Tabs> */}
      <div
        className="flex flex-wrap gap-4 w-full max-w-[800px]"
      >
        {
          sourceData?.map((data, index) => (
            <LogMessageCard logDataList={sourceLogData[index] || []} source={data} />
          ))
        }
      </div>
      {resultLogData
      && (
        <ClientOnly>
          {() => (
            <ImageExport>
              {
                resultLogData.message?.content.map((item: InfoItem) => (
                  <ResultMessage
                    data={item}
                    key={item.url}
                  />
                ))
              }
            </ImageExport>
          )}
        </ClientOnly>
      )}
    </div>
  )
}
