import type { AddressProvider, AddressSearchContext, AddressValue, LatLon } from "../types";
import { createTtlCache } from "./cache";
import { distanceMeters } from "../utils/distance";

export type AddressOption = AddressValue & { distanceMeters?: number };

export type CreateAddressSearcherOptions = {
  provider: AddressProvider;
  ctx: AddressSearchContext;

  minChars?: number;
  debounceMs?: number;

  /**
   * 0 or negative => disable caching
   */
  cacheTtlMs?: number;

  origin?: LatLon;
};

export type AddressSearcher = {
  search: (input: string) => Promise<AddressOption[]>;
  cancel: () => void;
  clearCache: () => void;
};

const makeKey = (q: string, ctx: AddressSearchContext) =>
  JSON.stringify({
    q,
    locale: ctx.locale ?? "",
    cc: (ctx.countryCodes ?? []).map((x) => x.toUpperCase()).sort(),
    rb: ctx.regionBias ?? { type: "none" },
  });

const withDistance = (items: AddressValue[], origin?: LatLon): AddressOption[] => {
  if (!origin) return items as AddressOption[];
  return items.map((o) => {
    if (!o.coordinates) return o as AddressOption;
    return { ...o, distanceMeters: distanceMeters(origin, o.coordinates) };
  });
};

export const createAddressSearcher = (opts: CreateAddressSearcherOptions): AddressSearcher => {
  const {
    provider,
    ctx,
    minChars = 3,
    debounceMs = 250,
    cacheTtlMs = 60_000,
    origin,
  } = opts;

  const cache = cacheTtlMs > 0 ? createTtlCache<AddressValue[]>(cacheTtlMs) : null;

  let abort: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  let pending:
    | { resolve: (v: AddressOption[]) => void; reject: (e: unknown) => void }
    | null = null;

  let seq = 0;

  const cancel = () => {
    seq += 1;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (abort) {
      abort.abort();
      abort = null;
    }

    if (pending) {
      pending.resolve([]);
      pending = null;
    }
  };

  const clearCache = () => cache?.clear();

  const search = (input: string) => {
    const q = input.trim();

    cancel();

    if (q.length < minChars) {
      return Promise.resolve<AddressOption[]>([]);
    }

    const key = makeKey(q, ctx);
    const cached = cache?.get(key);
    if (cached) {
      return Promise.resolve(withDistance(cached, origin));
    }

    const mySeq = seq;

    return new Promise<AddressOption[]>((resolve, reject) => {
      pending = { resolve, reject };

      timer = setTimeout(async () => {
        timer = null;

        if (mySeq !== seq) {
          pending?.resolve([]);
          pending = null;
          return;
        }

        abort = new AbortController();
        const controller = abort;

        try {
          const res = await provider.search(q, { ...ctx, signal: controller.signal });

          if (mySeq !== seq) {
            resolve([]);
            return;
          }

          cache?.set(key, res);
          resolve(withDistance(res, origin));
        } catch (e) {
          if ((e as any)?.name === "AbortError") {
            resolve([]);
            return;
          }
          reject(e);
        } finally {
          if (abort === controller) abort = null;
          if (pending?.resolve === resolve) pending = null;
        }
      }, debounceMs);
    });
  };

  return { search, cancel, clearCache };
};
