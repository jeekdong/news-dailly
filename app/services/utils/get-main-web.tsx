// web 这边特别复杂，需要考虑类似 plugin 的机制
// 定制解析的能力
// 例如对于时间的解析，支持保留某些 tag 的属性

import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

import { WebFetcher } from '../web-fetcher'
import { buildHTML } from '~/utils/constants'

export function formatHtmlString({
  htmlString,
  needTagName = false,
}: {
  htmlString: string
  needTagName?: boolean
}) {
  // 删除 HTML string 中的所有标签（包括标签内的属性）
  // 删除 script 标签内容
  const result = htmlString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 删除所有 style 标签内容
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // 删除换行，制表符
    .replace(/[\r\n\t]/g, '')
    .replace(/<[^>]*>/g, (match) => {
      // 保留标签名，删除标签内的属性
      if (needTagName)
        return match.replace(/<([^ ]*).*/, '<$1>')

      // 删除包括 标签名 和 标签属性
      return ''
    })
  return result
}

interface GetMainWebOptions {
  needHtmlTemplate?: boolean
  fetchMode?: 'browser' | 'fetch'
  algorithm?: 'regex' | 'readability'
  algorithmOptions?: {
    needTagName?: boolean
  }
}

export type GetMainWebByStringOptions = Omit<GetMainWebOptions, 'fetchMode'>
export type GetMainWebByUrlOptions = Omit<GetMainWebOptions, 'needHtmlTemplate'>

export function getMainWebByString(htmlString: string, options?: GetMainWebByStringOptions) {
  if (options?.needHtmlTemplate)
    htmlString = buildHTML(htmlString)

  const algorithm = options?.algorithm || 'readability'
  if (algorithm === 'regex') {
    return {
      success: true,
      content: formatHtmlString({
        htmlString,
        ...options?.algorithmOptions,
      }),
    }
  }
  else if (algorithm === 'readability') {
    const doc = new JSDOM(htmlString)

    const article = new Readability(doc.window.document).parse()
    return {
      success: true,
      content: article?.content || '',
    }
  }
  return {
    success: false,
    content: '',
  }
}

export async function getMainWebByUrl(url: string, options?: GetMainWebByUrlOptions) {
  let htmlString = ''
  const fetcher = new WebFetcher({ url, mode: options?.fetchMode || 'browser' })
  try {
    htmlString = await fetcher.fetchContent()
  }
  catch (err) {
    console.log('url 解析错误', err)
    return {
      success: false,
      error: err,
      content: '',
    }
  }

  return getMainWebByString(htmlString, options)
}
