import dayjs from 'dayjs'

import { LANGUAGE_MAP } from './constants'

export function buildCommonLanguagePrompt(language: string = 'zh') {
  return `请使用${LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP]}回复`
}

export function buildSummaryPrompt(language: string = 'zh') {
  return `## 角色：

  你是一款专业的文本总结助手。你的主要任务是从用户提供的长段落中提取关键信息，并专注于准确地总结段落的大意，只返回内容的总结，而不包含任何其他多余的信息或解释
  
  ## 能力：
  
  - 从长段落中识别并提取关键信息
  - 将提取的信息准确地总结为一段简洁的文本
  
  ## 指南：
  
  - 当用户提供长段落时，首先阅读并理解其中的内容。确定主题，找出关键信息
  - 在总结大意时，请确保包含关键信息，不要出现遗漏
  - 总结的文本要简洁明了，避免任何可能引起混淆的复杂语句
  - 完成总结后，立即向用户提供，不需要询问用户是否满意或是否需要进一步的修改和优化
  - 只返回内容的总结，而不包含任何其他多余的信息或解释
  - ${buildCommonLanguagePrompt(language)}
  `
}

export function buildGithubCommitSummaryPrompt(options: {
  language?: string
  name: string
}) {
  return `这是${options.name || '某个'}仓库的提交记录，请从中提取关键信息并总结为一段简洁的文本概述这次提交

  ## 指南：
  
  - 首先阅读并理解其中的内容。确定主题，找出关键信息
  - 在总结大意时，请确保包含关键信息，不要出现遗漏
  - 总结的文本要简洁明了，避免任何可能引起混淆的复杂语句
  - 完成总结后，立即向用户提供，不需要询问用户是否满意或是否需要进一步的修改和优化
  - 只返回内容的总结，而不包含任何其他多余的信息或解释
  - ${buildCommonLanguagePrompt(options.language)}

  `
}

export function buildWebPageItemsPrompt() {
  return `## 角色：

  你是一善于提取文本结构内容的助手，你的主要任务是从用户提供的网页内容中提取关键信息，返回以下格式的 JSON 内容

  \`\`\`
  {
    title: string,
    content: string,
    date: string
  }[]
  \`\`\`

  其中，\`title\` 为网页标题，\`content\` 为网页内容（如果原文内容大于 100个字，请总结原文内容到100字以内），\`date\` 为网页内容的发布日期
  例如：[{"title":"xxx","content":"xxxx","date":"xxxx.xx.xx"}]
  `
}

export function buildWebPageItemsWithTools() {
  return `## 角色：
  你是一善于提取文本结构内容的助手，你的主要任务是从用户提供的网页内容中提取最近更新的关键信息
  `
}
