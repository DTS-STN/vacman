import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  reqId: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

// Expose a safe global accessor so non-server modules (that cannot import Node APIs)
// can still retrieve the current correlation id if present. This avoids bundling
// node:async_hooks into client code while allowing best-effort correlation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any;
if (typeof g === 'object' && g) {
  g.__vacmanGetReqId = (): string | undefined => storage.getStore()?.reqId;
}
