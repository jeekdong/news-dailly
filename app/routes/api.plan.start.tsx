import { json } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node'
import dayjs from 'dayjs'

import {
  Plan,
} from '~/services/plan'
import type { Period, Source } from '~/types/plan'
import source from '~/data/frontend.json'

import {
  sendLog,
} from '~/services/utils/sse'

// start plan

export async function action({ request }: ActionFunctionArgs) {
  sendLog({
    message: {
      content: '开始解析',
      name: 'plan-start',
    },
    type: 'info',
  })
  sendLog({
    message: {
      content: source,
      name: 'source',
    },
    type: 'info',
  })
  const body = await request.formData()

  // start plan
  const duration = body.get('start') && body.get('end')
    ? {
        start: dayjs(body.get('start') as string).startOf('d').valueOf(),
        end: dayjs(body.get('end') as string).endOf('d').valueOf(),
      }
    : undefined
  const plan = new Plan({
    sources: source.feeds as Source[],
    duration,
  })
  plan.fetchUpdateWithSummary().then((result) => {
    sendLog({
      message: {
        content: result,
        name: 'plan-end',
      },
      type: 'info',
    })
  })

  return json({ code: 0, message: '开始解析' })
}
