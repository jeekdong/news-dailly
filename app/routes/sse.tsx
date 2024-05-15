import {
  Button,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { useLogEventSource } from '~/utils/hooks'

export default function Sse() {
  const logList = useLogEventSource('/api/sse')

  const startPlanFetcher = useFetcher()

  useEffect(() => {
    if (startPlanFetcher.data) {
      toast.success('开始解析', {
        position: 'top-center',
      })
    }
  }, [startPlanFetcher.data])

  return (
    <div>
      <startPlanFetcher.Form
        method="POST"
        action="/api/plan/start"
      >
        <Select
          name="period"
          className="w-1/2"
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
      </startPlanFetcher.Form>
      {
        logList?.map((log, index) => (
          <div key={index}>
            {log.message}
          </div>
        ))
      }
    </div>
  )
}
