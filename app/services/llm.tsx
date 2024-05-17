// 需要按照 不同 LLM 服务抽象，对外提供统一的接口
// 这里偷懒，为了快速实现

import process from 'node:process'

import Anthropic from '@anthropic-ai/sdk'
import 'dotenv/config'

const DEFAULT_BASE_URL = process.env.LLM_BASE_URL || ''
const apiKey = process.env.LLM_API_KEY || ''

export class LLM {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey,
      baseURL: DEFAULT_BASE_URL,
    })
  }

  async chat({
    content,
    system,
    prefillContent,
  }: {
    content: string
    system?: string
    prefillContent?: string
  }) {
    const messages = [{ role: 'user', content }] as Anthropic.MessageParam[]
    if (prefillContent)
      messages.push({ role: 'assistant', content: prefillContent })

    const message = await this.client.messages.create({
      max_tokens: 4096,
      // 它是支持图片输入的
      messages,
      model: 'claude-3-haiku',
      system,
    })
    console.log('LLM 获得响应', message)
    return message.content[0]
  }

  async chatWithTools({
    content,
    system,
    tools,
  }: {
    content: string
    system?: string
    tools: Anthropic.Beta.Tools.Tool[]
  }) {
    const messages = [{ role: 'user', content }] as Anthropic.MessageParam[]

    return await this.client.beta.tools.messages.create({
      max_tokens: 4096,
      // 它是支持图片输入的
      messages,
      model: 'claude-3-haiku',
      system,
      tools,
    })
  }
}
