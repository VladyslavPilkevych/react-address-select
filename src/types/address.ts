import type { LatLon } from "./geo";

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
