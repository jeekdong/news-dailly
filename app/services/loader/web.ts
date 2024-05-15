import {
  getMainWebByUrl
} from '~/services/utils/get-main-web'
import type {
  GetMainWebByUrlOptions
} from '~/services/utils/get-main-web'

export class WebLoader {

  parse(url: string, options?: GetMainWebByUrlOptions) {
    return getMainWebByUrl(url, options)
  }
}
