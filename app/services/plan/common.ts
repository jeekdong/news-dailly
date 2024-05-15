// 使用策略模式
export interface IPlanStrategy {
  fetchUpdateWithSummary: () => Promise<{
    title: string
    content: string
    date: string
  }[]>
}
