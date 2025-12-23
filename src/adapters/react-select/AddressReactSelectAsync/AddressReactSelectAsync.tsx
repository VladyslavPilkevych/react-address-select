import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import type { SingleValue } from "react-select";
import type { AddressProvider, AddressSearchContext, AddressValue, LatLon, RegionBias } from "../../../types";
import { createAddressSearcher } from "../../../core/createAddressSearcher";
import { formatDistanceMeters } from "../../../utils/distance";

export type AddressReactSelectAsyncOption = AddressValue & { distanceMeters?: number };

export type AddressReactSelectAsyncProps = {
  provider: AddressProvider;
  value: AddressValue | null;
  onChange: (value: AddressValue | null) => void;

  locale?: string;
  countryCodes?: string[];
  regionBias?: RegionBias;

  origin?: LatLon;

  placeholder?: string;
  isDisabled?: boolean;

  minChars?: number;
  debounceMs?: number;

  /**
   * react-select internal cache
   */
  cacheOptions?: boolean;

  /** TTL for core-cache */
  cacheTtlMs?: number;

  /** Error from provider */
  onError?: (err: unknown) => void;

  getOptionLabel?: (opt: AddressReactSelectAsyncOption) => string;
};

const defaultGetOptionLabel = (opt: AddressReactSelectAsyncOption) => {
  if (typeof opt.distanceMeters !== "number") return opt.label;
  return `${opt.label} · ${formatDistanceMeters(opt.distanceMeters)}`;
};

export const AddressReactSelectAsync = (props: AddressReactSelectAsyncProps) => {
  const {
    provider,
    value,
    onChange,
    locale,
    countryCodes,
    regionBias,
    origin,
    placeholder,
    isDisabled,

    minChars = 3,
    debounceMs = 250,

    cacheOptions = true,
    cacheTtlMs = cacheOptions ? 60_000 : 0,

    onError,
    getOptionLabel = defaultGetOptionLabel,
  } = props;

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

  useEffect(() => {
    return () => searcher.cancel();
  }, [searcher]);

  const [inputValue, setInputValue] = useState("");

  const loadOptions = (input: string) =>
    searcher.search(input).catch((e) => {
      onError?.(e);
      return [];
    });

  return (
    <AsyncSelect<AddressReactSelectAsyncOption, false>
      isDisabled={isDisabled}
      cacheOptions={cacheOptions}
      defaultOptions={false}
      loadOptions={loadOptions}
      value={(value as AddressReactSelectAsyncOption) ?? null}
      onChange={(v: SingleValue<AddressReactSelectAsyncOption>) =>
        onChange((v as AddressValue) ?? null)
      }
      inputValue={inputValue}
      onInputChange={(v) => {
        setInputValue(v);
        return v;
      }}
      getOptionLabel={(o) => getOptionLabel(o)}
      getOptionValue={(o) => o.id ?? o.label}
      placeholder={placeholder}
      loadingMessage={() => "Loading…"}
      noOptionsMessage={() => "No results"}
    />
  );
};
