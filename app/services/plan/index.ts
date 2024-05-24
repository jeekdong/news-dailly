import { GithubPlan } from './github'
import { RssPlan } from './rss'
import { WebPlan } from './web'

import {
  createTaskEndLog,
  createTaskErrorLog,
  createTaskStartLog,
  sendLog,
} from '~/services/utils/sse'

import type { Duration, Source } from '~/types/plan'

export class Plan {
  public sources: Source[]
  public duration?: Duration

  constructor(options: {
    sources: Source[]
    duration?: Duration
  }) {
    this.sources = options.sources
    this.duration = options.duration
  }

  async fetchUpdateWithSummary() {
    // 针对多个类型的 任务，需要处理同时请求过多的问题
    // 限制并发数量
    const MAX_CONCURRENCY = 5
    const queue: Source[][] = []
    let temp: Source[] = []
    this.sources.forEach((source, index) => {
      temp.push(source)
      if (
        temp.length >= MAX_CONCURRENCY
        || index === this.sources.length - 1
      ) {
        queue.push(temp)
        temp = [source]
      }
    })
    const result = []
    for (const sources of queue) {
      const data = await Promise.all(sources.map(async (source) => { // 任务启动 log
        createTaskStartLog(source.url)
        let taskResult = {}
        if (source.type === 'rss') {
          const rssPlan = new RssPlan({
            url: source.url,
            duration: this.duration,
          })
          taskResult = {
            name: source.name,
            items: await rssPlan.fetchUpdateWithSummary(),
            url: source.url,
          }
        }
        else if (source.type === 'github') {
          const githubPlan = new GithubPlan({
            source,
            duration: this.duration,
          })
          taskResult = {
            name: source.name,
            items: await githubPlan.fetchUpdateWithSummary(),
            url: source.url,
          }
        }
        else if (source.type === 'web') {
          const webPlan = new WebPlan({
            url: source.url,
            duration: this.duration,
          })
          taskResult = {
            name: source.name,
            items: await webPlan.fetchUpdateWithSummary(),
            url: source.url,
          }
        }
        else {
          createTaskErrorLog(source.url, '未知类型')
          taskResult = {
            name: source.name,
            items: [],
            url: source.url,
          }
        }
        // 任务结束 log
        createTaskEndLog(source.url)
        return taskResult
      }))
      result.push(...data)
    }
    return result
  }
}
