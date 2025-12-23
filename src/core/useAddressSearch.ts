import { useEffect, useMemo, useRef, useState } from "react";
import type { AddressProvider, AddressSearchContext, LatLon, RegionBias } from "../types";
import { createAddressSearcher, type AddressOption } from "./createAddressSearcher";

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

export type UseAddressSearchResult = {
  inputValue: string;
  setInputValue: (v: string) => void;
  options: AddressOption[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
};

export const useAddressSearch = (opts: UseAddressSearchOptions): UseAddressSearchResult => {
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

  const searcher = useMemo(
    () =>
      createAddressSearcher({
        provider,
        ctx,
        minChars,
        debounceMs,
        cacheTtlMs,
        origin,
      }),
    [provider, ctx, minChars, debounceMs, cacheTtlMs, origin]
  );

  const requestId = useRef(0);
  const refetch = () => setTick((x) => x + 1);

  useEffect(() => {
    const q = inputValue.trim();

    if (!q || q.length < minChars) {
      searcher.cancel();
      setOptions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const id = ++requestId.current;

    setIsLoading(true);
    setError(null);

    searcher.search(inputValue).then(
      (res) => {
        if (requestId.current !== id) return;
        setOptions(res);
        setIsLoading(false);
      },
      (e) => {
        if (requestId.current !== id) return;
        setError(e);
        setIsLoading(false);
      }
    );
  }, [inputValue, tick, minChars, searcher]);

  useEffect(() => {
    return () => searcher.cancel();
  }, [searcher]);

  return { inputValue, setInputValue, options, isLoading, error, refetch };
};
