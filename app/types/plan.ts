export type Period = 'day' | 'week' | 'month'

export interface Source {
  name: string
  url: string
  type: 'rss' | 'github'
}
