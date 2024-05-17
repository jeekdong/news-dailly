export type Period = 'day' | 'week' | 'month'

export interface Source {
  name: string
  url: string
  type: 'rss' | 'github'
}

export interface InfoItemData {
  title: string
  content: string
  date: string
}

export interface InfoItem {
  name: string
  items: InfoItemData[]
  url: string
}
