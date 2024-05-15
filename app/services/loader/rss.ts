import Parser from 'rss-parser'

export class RssLoader {
  private client: Parser

  constructor() {
    this.client = new Parser()
  }

  parse(url: string) {
    return this.client.parseURL(url)
  }
}

// async function test() {
//   const rssLoader = new RssLoader()
//   const feed = await rssLoader.parse('http://www.jintiankansha.me/rss/GEZDAMRXPQ4GIMZTG44DMZTFGE3DMMTBMYYDQZLGMVTGKMZZGI3DSMJWMI4TSNTBG4ZWMYLDME======')
//   feed.items.forEach(item => {
//     console.log(item.title + ':' + item.link + dayjs(item.pubDate || '').format('YYYY-MM-DD HH:mm:ss'))
//   });
// }
// test()