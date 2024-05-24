export type Period = 'day' | 'week' | 'month'

export interface Duration {
  start: number
  end: number
}

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
