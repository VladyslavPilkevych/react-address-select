import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AddressProvider,
  AddressSearchContext,
  AddressValue,
  LatLon,
  RegionBias,
} from "../types";
import { createTtlCache } from "../cache";
import { distanceMeters } from "../distance";

export type UseAddressSearchOptions = {
  provider: AddressProvider;
  locale?: string;
  countryCodes?: string[];
  regionBias?: RegionBias;
  minChars?: number;
  debounceMs?: number;
  cacheTtlMs?: number;
  origin?: LatLon;
};

export type AddressOption = AddressValue & { distanceMeters?: number };

export type UseAddressSearchResult = {
  inputValue: string;
  setInputValue: (v: string) => void;
  options: AddressOption[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
};

const makeKey = (q: string, ctx: AddressSearchContext) =>
  JSON.stringify({
    q,
    locale: ctx.locale ?? "",
    cc: (ctx.countryCodes ?? []).map((x) => x.toUpperCase()).sort(),
    rb: ctx.regionBias ?? { type: "none" },
  });

export const useAddressSearch = (
  opts: UseAddressSearchOptions
): UseAddressSearchResult => {
  const {
    provider,
    locale,
    countryCodes,
    regionBias,
    minChars = 3,
    debounceMs = 250,
    cacheTtlMs = 60_000,
    origin,
  } = opts;

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AddressOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);

  const ctx = useMemo<AddressSearchContext>(
    () => ({ locale, countryCodes, regionBias }),
    [locale, countryCodes, regionBias]
  );

  const cache = useMemo(
    () => createTtlCache<AddressValue[]>(cacheTtlMs),
    [cacheTtlMs]
  );
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  const refetch = () => setTick((x) => x + 1);

  useEffect(() => {
    const q = inputValue.trim();

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (q.length < minChars) {
      setOptions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const key = makeKey(q, ctx);
    lastKeyRef.current = key;

    const cached = cache.get(key);
    if (cached) {
      const withDistance = cached.map((o) => {
        if (!origin || !o.coordinates) return o as AddressOption;
        return { ...o, distanceMeters: distanceMeters(origin, o.coordinates) };
      });
      setOptions(withDistance);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    timeoutRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await provider.search(q, {
          ...ctx,
          signal: controller.signal,
        });
        if (lastKeyRef.current !== key) return;

        cache.set(key, res);

        const withDistance = res.map((o) => {
          if (!origin || !o.coordinates) return o as AddressOption;
          return {
            ...o,
            distanceMeters: distanceMeters(origin, o.coordinates),
          };
        });

        setOptions(withDistance);
        setIsLoading(false);
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setError(e);
        setIsLoading(false);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [inputValue, minChars, debounceMs, provider, cache, ctx, origin, tick]);

  return { inputValue, setInputValue, options, isLoading, error, refetch };
};
