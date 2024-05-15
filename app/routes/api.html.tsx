import { json } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node'

import { getMainWebByUrl } from '~/services/utils/get-main-web'

// 非 get
export async function action({ request }: ActionFunctionArgs) {
  let url = ''
  try {
    const body = await request.json()
    url = body.url
  }
  catch (err) {
    console.log('/api/html 请求解析错误', err)
    return json({ code: 1, message: '请求解析错误' })
  }

  const parseResult = await getMainWebByUrl(url)

  if (!parseResult.success)
    return json({ code: 2, message: 'url 解析错误' })

  return json({ code: 0, content: parseResult.content, message: '解析成功' })
}
