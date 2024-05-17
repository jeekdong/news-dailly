import { GithubPlan } from './github'
import { RssPlan } from './rss'
import { WebPlan } from './web'

import {
  sendLog,
} from '~/services/utils/sse'

import type { Period, Source } from '~/types/plan'

export class Plan {
  public sources: Source[]
  public period: Period

  constructor(options: {
    sources: Source[]
    period: Period
  }) {
    this.sources = options.sources
    this.period = options.period
  }

  async fetchUpdateWithSummary() {
    return Promise.all(this.sources.map(async (source) => {
      if (source.type === 'rss') {
        sendLog({
          message: {
            content: `RSS 类型`,
            name: '任务类型',
            key: source.url,
          },
          type: 'info',
        })
        const rssPlan = new RssPlan({
          url: source.url,
          period: this.period,
        })
        return {
          name: source.name,
          items: await rssPlan.fetchUpdateWithSummary(),
          url: source.url,
        }
      }
      else if (source.type === 'github') {
        sendLog({
          message: {
            content: `Github 类型`,
            name: '任务类型',
            key: source.url,
          },
          type: 'info',
        })
        const githubPlan = new GithubPlan({
          source,
          period: this.period,
        })
        return {
          name: source.name,
          items: await githubPlan.fetchUpdateWithSummary(),
          url: source.url,
        }
      }
      else if (source.type === 'web') {
        sendLog({
          message: {
            content: `Web 类型`,
            name: '任务类型',
            key: source.url,
          },
          type: 'info',
        })
        const webPlan = new WebPlan({
          url: source.url,
          period: this.period,
        })
        return {
          name: source.name,
          items: await webPlan.fetchUpdateWithSummary(),
          url: source.url,
        }
      }
      sendLog({
        message: {
          content: `未知类型`,
          name: '任务类型',
          key: source.url,
        },
        type: 'info',
      })
      return {
        name: source.name,
        items: [],
        url: source.url,
      }
    }))
  }
}
