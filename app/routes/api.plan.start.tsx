import { json } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node'

import {
  Plan,
} from '~/services/plan'
import type { Period, Source } from '~/types/plan'
import source from '~/source.json'

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
  const plan = new Plan({
    sources: source.feeds as Source[],
    period: body.get('period') as Period,
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
