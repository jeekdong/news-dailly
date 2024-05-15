import { WebFetcher } from './web-fetcher'

async function test() {
  const webFetcher = new WebFetcher({ url: 'https://www.baidu.com', mode: 'browser' })
  const parseResult = await webFetcher.fetchContent()
  console.log('parseResult', parseResult)
}

test()