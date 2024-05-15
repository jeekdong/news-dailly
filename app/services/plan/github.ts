import dayjs from 'dayjs'

import { GithubLoader } from '../loader/githhub'
import { LLM } from '../llm'
import type { IPlanStrategy } from './common'

import { buildGithubCommitSummaryPrompt } from '~/utils/prompt'

import type { Period, Source } from '~/types/plan'

import { sendLog } from '~/services/utils/sse'

export class GithubPlan implements IPlanStrategy {
  public period: Period
  public source: Source
  public loader: GithubLoader

  constructor(options: {
    period?: Period
    source: Source
  }) {
    this.period = options.period || 'day'
    this.source = options.source
    this.loader = new GithubLoader({
      repoUrl: options.source.url,
    })
  }

  async getSummary(
    content: string,
  ) {
    const llm = new LLM()

    const result = await llm.chat({
      content,
      system: buildGithubCommitSummaryPrompt({
        name: this.source.name,
      }),
    })
    return result.text
  }

  async fetchUpdateWithSummary() {
    const commits = await this.loader.parse({
      since: dayjs().subtract(1, this.period).toISOString(),
    }) || []
    return Promise.all(commits.map(async (commit) => {
      const summary = await this.getSummary(`commit: ${commit.title}, date: ${dayjs(commit.date).format('YYYY-MM-DD HH:mm:ss')}, files: ${JSON.stringify(commit.files)}}`)

      sendLog({
        message: `Github 获取内容: ${this.source.url}, 标题: ${commit.title}, 总结: ${summary} 日期: ${dayjs(commit.date).format('YYYY-MM-DD HH:mm:ss')}`,
        type: 'info',
      })

      return {
        title: commit.title,
        content: summary,
        date: dayjs(commit.date).format('YYYY-MM-DD HH:mm:ss'),
      }
    }))
  }
}

// async function test() {
//   const rssPlan = new GithubPlan({
//     source: {
//       url: 'https://github.com/hijiangtao/javascript-articles-monthly',
//       name: 'JavaScript 文章精选月刊',
//       type: 'github'
//     },
//     period: 'day'
//   })
//   const result = await rssPlan.fetchUpdateWithSummary()
//   console.log(result)
// }
// test()
