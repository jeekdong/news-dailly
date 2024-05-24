import dayjs from 'dayjs'

import { getMainWebByString } from '../utils/get-main-web'
import { LLM } from '../llm'
import { RssLoader } from '../loader/rss'

import type { IPlanStrategy } from './common'
import { buildSummaryPrompt } from '~/utils/prompt'

import { sendLog } from '~/services/utils/sse'
import type { Duration } from '~/types/plan'
import { DEFAULT_DURATION } from '~/utils/constants'

export class RssPlan implements IPlanStrategy {
  public duration: Duration
  public url: string
  public loader: RssLoader
  public detailMode: 'full' | 'content'

  constructor(options: {
    duration?: Duration
    url: string
    detailMode?: 'full' | 'content'
  }) {
    // 默认昨天
    this.duration = options.duration || DEFAULT_DURATION
    this.url = options.url
    this.detailMode = options.detailMode || 'content'
    this.loader = new RssLoader()
  }

  async fetchUpdateItem() {
    const feeds = await this.loader.parse(this.url)
    // 根据时间判断是否有更新
    const updateItems = feeds.items.filter((item) => {
      return dayjs(item.pubDate || '').valueOf() >= this.duration.start
        && dayjs(item.pubDate || '').valueOf() <= this.duration.end
    })
    return updateItems
  }

  async getSummary(
    content: string,
  ) {
    const parseResult = getMainWebByString(content, { needHtmlTemplate: true })
    if (!parseResult.success) {
      // TODO: 通用报错
      return ''
    }
    const llm = new LLM()

    const result = await llm.chat({
      content: parseResult.content,
      system: buildSummaryPrompt(),
    })
    return result.text
  }

  async fetchUpdateWithSummary() {
    const items = await this.fetchUpdateItem()
    if (this.detailMode === 'content') {
      sendLog({
        message: {
          content: `获取${items.length}项内容`,
          name: '更新内容数',
          key: this.url,
        },
        type: 'info',
      })
      return Promise.all(items.map(async (item) => {
        const summary = await this.getSummary(item.content || '')

        sendLog({
          message: {
            name: '获取内容',
            content: {
              title: item.title,
              summary,
              date: dayjs(item.pubDate || '').format('YYYY-MM-DD HH:mm:ss'),
            },
            key: this.url,
          },
          type: 'info',
        })
        return {
          title: item.title || '',
          content: summary,
          date: dayjs(item.pubDate || '').format('YYYY-MM-DD HH:mm:ss'),
        }
      }))
    }
    return []
  }
}
