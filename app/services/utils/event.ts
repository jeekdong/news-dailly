// @/app/common/emitter.ts
import { EventEmitter } from "events";

let emitter: EventEmitter;

declare global {
  // eslint-disable-next-line no-var
  var __emitter: EventEmitter | undefined;
}

if (process.env.NODE_ENV === "production") {
  emitter = new EventEmitter();
} else {
  // 开发环境，保证全局只有一个 emitter
  if (!global.__emitter) {
    global.__emitter = new EventEmitter();
  }
  emitter = global.__emitter;
}

export { emitter };

export const QUEUE_LOG_EVT_NAME = "queue-log";
