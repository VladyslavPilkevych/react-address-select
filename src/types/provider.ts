import type { RegionBias } from "./geo";
import type { AddressValue } from "./address";

export type AddressSearchContext = {
  locale?: string;
  countryCodes?: string[];
  regionBias?: RegionBias;
  signal?: AbortSignal;
};

export type AddressProvider = {
  id: string;
  search: (query: string, ctx: AddressSearchContext) => Promise<AddressValue[]>;
};
