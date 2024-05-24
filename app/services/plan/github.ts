import dayjs from 'dayjs'

import { GithubLoader } from '../loader/github'
import { LLM } from '../llm'
import type { IPlanStrategy } from './common'

import { buildGithubCommitSummaryPrompt } from '~/utils/prompt'

import type { Duration, Source } from '~/types/plan'

import { sendLog } from '~/services/utils/sse'
import { DEFAULT_DURATION } from '~/utils/constants'

export class GithubPlan implements IPlanStrategy {
  public duration: Duration
  public source: Source
  public loader: GithubLoader

  constructor(options: {
    duration?: Duration
    source: Source
  }) {
    this.duration = options.duration || DEFAULT_DURATION
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
      since: dayjs(this.duration.start).toISOString(),
      until: dayjs(this.duration.end).toISOString(),
    }) || []
    sendLog({
      message: {
        content: `获取${commits.length}项内容`,
        name: '更新内容数',
        key: this.source.url,
      },
      type: 'info',
    })
    return Promise.all(commits.map(async (commit) => {
      const summary = await this.getSummary(`commit: ${commit.title}, date: ${dayjs(commit.date).format('YYYY-MM-DD HH:mm:ss')}, files: ${JSON.stringify(commit.files)}}`)

      sendLog({
        message: {
          name: '获取内容',
          content: {
            title: commit.title,
            summary,
            date: dayjs(commit.date).format('YYYY-MM-DD HH:mm:ss'),
          },
          key: this.source.url,
        },
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
