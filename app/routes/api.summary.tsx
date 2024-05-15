import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

import { getMainWebByUrl } from '~/services/utils/get-main-web'
import { LLM } from '~/services/llm'
// import { usePromptStore } from '~/store/prompt'
// TODO: 修改
import { buildSummaryPrompt } from '~/utils/prompt'

export const action = async ({ request }: ActionFunctionArgs) => {
  let url = ''
  try {
    const body = await request.json();
    url = body.url
  } catch(err) {
    console.log('/api/summary 请求解析错误', err)
    return json({ code: 1, message: "请求解析错误" });
  }

  const parseResult = await getMainWebByUrl(url)
  if (!parseResult.success) {
    return json({ code: 2, message: "url 解析错误" });
  }
  const llm = new LLM()

  const content = await llm.chat({
    content: parseResult.content,
    system: buildSummaryPrompt()
  })

  return json({ code: 0,  content, message: "解析成功" });

}