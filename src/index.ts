// Types
export type {
  AddressProvider,
  AddressSearchContext,
  AddressValue,
  AddressComponents,
  LatLon,
  RegionBias,
  BBox,
} from "./types";

// Utils
export { distanceMeters } from "./utils/distance";
export { formatDistanceMeters } from "./utils/distance";

// Providers
export { createNominatimProvider } from "./providers/nominatim";
export type { NominatimProviderOptions } from "./providers/nominatim";

// Core
export { useAddressSearch } from "./core/useAddressSearch";
export type {
  UseAddressSearchOptions,
  UseAddressSearchResult,
} from "./core/useAddressSearch";

export { createAddressSearcher } from "./core/createAddressSearcher";
export type {
  CreateAddressSearcherOptions,
  AddressSearcher,
  AddressOption,
} from "./core/createAddressSearcher";

// UI
export { AddressSelect } from "./components/AddressSelect";
export type {
  AddressSelectProps,
  AddressSelectOption,
} from "./components/AddressSelect";
