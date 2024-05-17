import dayjs from 'dayjs'
import { WebLoader } from '../loader/web'
import type { IPlanStrategy } from './common'
import { buildWebPageItemsPrompt, buildWebPageItemsWithTools } from '~/utils/prompt'

import { LLM } from '~/services/llm'

import type { Period } from '~/types/plan'

import { sendLog } from '~/services/utils/sse'

export class WebPlan implements IPlanStrategy {
  public period: Period
  public url: string
  public loader: WebLoader

  constructor(options: {
    period?: Period
    url: string
  }) {
    this.period = options.period || 'day'
    this.url = options.url
    this.loader = new WebLoader()
  }

  async fetchItems() {
    const parseResult = await this.loader.parse(this.url, {
      algorithm: 'regex',
      algorithmOptions: {
        needTagName: true,
      },
    })
    if (!parseResult.success)
      return []

    const llm = new LLM()
    const result = await llm.chatWithTools({
      content: parseResult.content,
      system: buildWebPageItemsWithTools(),
      tools: [
        {
          name: 'extractor',
          description: '获得网页最近更新的内容',
          input_schema: {
            type: 'object',
            properties: {
              keyPointItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description: '关键内容标题（如果没有请生成15字内标题）',
                    },
                    content: {
                      type: 'string',
                      description: '关键内容（如果原文内容大于 100个字，请总结原文内容到100字以内）',
                    },
                    date: {
                      type: 'string',
                      description: '关键内容发布日期',
                    },
                  },
                },
              },
            },
          },
        },
      ],
    })
    // 找到 tool_use 里面的 keyPointItems
    // @ts-expect-error
    const keyPointItems = (result.content.find(item => item.type === 'tool_use')?.input?.keyPointItems) as {
      title: string
      content: string
      date: string
    }[]
    return keyPointItems || []
  }

  async fetchUpdateWithSummary() {
    const items = await this.fetchItems()

    const result = items.filter(item => dayjs(item.date).isAfter(dayjs().subtract(1, this.period)))

    sendLog({
      message: {
        content: `获取${result.length}项内容`,
        name: '更新内容数',
        key: this.url,
      },
      type: 'info',
    })

    return result.map((item) => {
      sendLog({
        message: {
          name: '获取内容',
          content: {
            title: item.title,
            content: item.content,
            date: dayjs(item.date).format('YYYY-MM-DD HH:mm:ss'),
          },
          key: this.url,
        },
        type: 'info',
      })
      return {
        title: item.title,
        content: item.content,
        date: dayjs(item.date).format('YYYY-MM-DD HH:mm:ss'),
      }
    })
  }
}

// async function test() {
//   const webPlan = new WebPlan({
//     url: 'https://vitejs.dev/blog.html',
//     period: 'month',
//   })
//   const result = await webPlan.fetchUpdateWithSummary()
//   console.log(result)
// }
// test()
