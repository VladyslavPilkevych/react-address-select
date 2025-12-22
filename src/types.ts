export type LatLon = { lat: number; lon: number };

export type RegionBias =
  | { type: "none" }
  | {
      type: "centerRadius";
      center: LatLon;
      radiusMeters: number;
      strict?: boolean;
    }
  | {
      type: "bbox";
      bbox: [west: number, south: number, east: number, north: number];
      strict?: boolean;
    };

export type AddressComponents = Partial<{
  countryCode: string;
  country: string;
  region: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
}>;

export type AddressValue = {
  label: string;
  coordinates?: LatLon;
  components?: AddressComponents;
  provider?: string;
  id?: string;
  raw?: unknown;
};

export type AddressSearchContext = {
  locale?: string;
  countryCodes?: string[];
  regionBias?: RegionBias;
};

export type AddressProvider = {
  id: string;
  search: (
    query: string,
    ctx: AddressSearchContext & { signal?: AbortSignal }
  ) => Promise<AddressValue[]>;
};
