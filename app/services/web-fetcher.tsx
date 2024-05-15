import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { KnownDevices } from 'puppeteer';

interface Options {
  url: string;
  mode?: 'fetch' | 'browser';
}

// 使用策略模式
interface IFetchStrategy {
  fetchContent(url: string): Promise<string>;
}

class FetchStrategy implements IFetchStrategy {
  async fetchContent(url: string, options?: RequestInit) {
    const res = await fetch(url, options);
    return await res.text();
  }
}

class BrowserStrategy implements IFetchStrategy {
  async fetchContent(url: string) {
    // browser
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ]
    });
    const page = await browser.newPage();
    await page.emulate(KnownDevices['iPhone 12 Pro'])
    await page.goto(url);
    const content = await page.content();
    await browser.close();
    return content;
  }
}

export class WebFetcher {

  private url: string;
  private mode: Required<Options['mode']>;

  private strategy: IFetchStrategy;

  constructor(options: Options) {
    this.url = options.url;
    this.mode = options.mode || 'fetch';
    this.strategy = this.mode === 'browser' ? new BrowserStrategy() : new FetchStrategy();
  }

  async fetchContent() {
    return await this.strategy.fetchContent(this.url);
  }

}