import type { LoaderFunction } from '@remix-run/node'

import { eventStream } from 'remix-utils/sse/server'

import { QUEUE_LOG_EVT_NAME, emitter } from '~/services/utils/event'

import { sendLog } from '~/services/utils/sse'

export const loader: LoaderFunction = ({ request }) => {
  // event stream setup
  return eventStream(request.signal, (send) => {
    // listener handler
    const listener = (data: string) => {
      // data should be serialized
      send({ data })
    }

    sendLog({
      type: 'info',
      message: 'server sent event',
    })

    // event listener itself
    emitter.on(QUEUE_LOG_EVT_NAME, listener)

    // cleanup
    return () => {
      emitter.off(QUEUE_LOG_EVT_NAME, listener)
    }
  })
}
