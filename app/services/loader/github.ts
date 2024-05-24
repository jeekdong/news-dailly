import { Octokit } from 'octokit'

import dayjs from 'dayjs'

export class GithubLoader {
  private client: Octokit
  private owner: string
  private repo: string
  private mode: 'commit' | 'file'

  constructor(options: {
    repoUrl: string
    mode?: 'commit' | 'file'
  }) {
    this.client = new Octokit()
    const { owner, repo } = this.parseRepoUrl(options.repoUrl)
    this.owner = owner
    this.repo = repo
    this.mode = options.mode || 'commit'
  }

  parseRepoUrl(repoUrl: string) {
    // repoURL: https://github.com/hijiangtao/javascript-articles-monthly
    const { pathname } = new URL(repoUrl)
    const [owner, repo] = pathname.split('/').slice(-2)
    return {
      owner,
      repo,
    }
  }

  async getCommits(options?: {
    since?: string
    path?: string
    until?: string
  }) {
    const { data } = await this.client.rest.repos.listCommits({
      owner: this.owner,
      repo: this.repo,
      since: options?.since,
      path: options?.path,
      until: options?.until,
    })
    return data
  }

  async getCommitFileDiff(commitSha: string) {
    const { data } = await this.client.rest.repos.getCommit({
      owner: this.owner,
      repo: this.repo,
      ref: commitSha,
    })
    return data.files
  }

  async getFileContent(filePath: string) {
    const { data } = await this.client.rest.repos.getContent({
      mediaType: {
        format: 'raw',
      },
      owner: this.owner,
      repo: this.repo,
      path: filePath,
    })
    return data
  }

  async parse(options: {
    since?: string
    path?: string
    until?: string
  }) {
    if (this.mode === 'commit') {
      const commits = await this.getCommits({
        since: options.since,
        path: 'README.md',
        until: options.until,
      })
      // 遍历获得每个 commit 的 diff
      const diffs = await Promise.all(commits.map(async (commit) => {
        return await this.getCommitFileDiff(commit.sha)
      }))
      return diffs.map((diff, index) => ({
        sha: commits[index].sha,
        title: commits[index].commit.message,
        files: diff,
        date: commits[index].commit.author?.date,
      }))
    }
  }
}

// async function test() {
//   const githubLoader = new GithubLoader({
//     repoUrl: 'https://github.com/hijiangtao/javascript-articles-monthly',
//   });
//   const result = await githubLoader.parse({
//     since: dayjs().subtract(1, 'day').toISOString(),
//     path: 'README.md'
//   })
//   // const result = await githubLoader.getCommitFileDiff('6ab66068aad10dde0691014407daae20599e4bb6')
//   console.log(JSON.stringify(result))
// }

// test()
