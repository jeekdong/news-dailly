export const LANGUAGE_MAP = {
  'zh': '中文',
  'en': '英文',
}

export const buildHTML = (content: string, title?: string) => {
  return `<!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body>
    ${content}
  </body>
  </html>`
}