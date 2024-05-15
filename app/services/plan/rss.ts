import dayjs from 'dayjs'

import { getMainWebByString } from '../utils/get-main-web'
import { LLM } from '../llm'
import { RssLoader } from '../loader/rss'

import type { IPlanStrategy } from './common'
import { buildSummaryPrompt } from '~/utils/prompt'

import { sendLog } from '~/services/utils/sse'

export class RssPlan implements IPlanStrategy {
  public period: 'day' | 'week' | 'month'
  public url: string
  public loader: RssLoader
  public detailMode: 'full' | 'content'

  constructor(options: {
    period?: 'day' | 'week' | 'month'
    url: string
    detailMode?: 'full' | 'content'
  }) {
    this.period = options.period || 'day'
    this.url = options.url
    this.detailMode = options.detailMode || 'content'
    this.loader = new RssLoader()
  }

  async fetchUpdateItem() {
    const feeds = await this.loader.parse(this.url)
    // 根据时间判断是否有更新
    const updateItems = feeds.items.filter((item) => {
      return dayjs(item.pubDate || '').isAfter(dayjs().subtract(1, this.period))
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
      return Promise.all(items.map(async (item) => {
        const summary = await this.getSummary(item.content || '')

        sendLog({
          message: `RSS 获取内容: ${this.url}, 标题: ${item.title}, 总结: ${summary} 日期: ${dayjs(item.pubDate || '').format('YYYY-MM-DD HH:mm:ss')}`,
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
