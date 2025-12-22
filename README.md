# react-address-select

[![npm version](https://img.shields.io/npm/v/react-address-select.svg)](https://www.npmjs.com/package/react-address-select)
[![npm downloads](https://img.shields.io/npm/dm/react-address-select.svg)](https://www.npmjs.com/package/react-address-select)


A flexible React address autocomplete/select library with pluggable providers, locale/region biasing, and optional distance calculation.

## Features

- Provider-agnostic core API
- Built-in Nominatim provider (OpenStreetMap)
- Region biasing (bbox or center + radius)
- Debounced search with caching + request cancelation
- Optional distance calculation from an origin point
- Minimal UI component included (`AddressSelect`)
- Optional `react-select/async` wrapper (subpath export)

## Install

npm i react-address-select

## Quick start

```tsx
import { useMemo, useState } from "react";
import { AddressSelect, createNominatimProvider } from "react-address-select";
import type { AddressValue, RegionBias } from "react-address-select";

export function Example() {
  const provider = useMemo(() => createNominatimProvider(), []);
  const [value, setValue] = useState<AddressValue | null>(null);

  const origin = { lat: 48.1486, lon: 17.1077 };

  const regionBias: RegionBias = {
    type: "centerRadius",
    center: origin,
    radiusMeters: 40000,
    strict: false
  };

  return (
    <AddressSelect
      provider={provider}
      value={value}
      onChange={setValue}
      locale="en"
      origin={origin}
      regionBias={regionBias}
      placeholder="Type an address…"
    />
  );
}
```

## react-select/async wrapper

```bash
npm i react-select
```

```tsx
import { useMemo, useState } from "react";
import { createNominatimProvider } from "react-address-select";
import { AddressReactSelectAsync } from "react-address-select/react-select";
import type { AddressValue } from "react-address-select";

export function ExampleReactSelect() {
  const provider = useMemo(() => createNominatimProvider(), []);
  const [value, setValue] = useState<AddressValue | null>(null);

  return (
    <AddressReactSelectAsync
      provider={provider}
      value={value}
      onChange={setValue}
      placeholder="Search address…"
    />
  );
}
```

## Provider notes

The built-in provider uses Nominatim (OpenStreetMap). Please respect the Nominatim usage policy.
For production workloads, consider using your own instance or a provider with an SLA.

## API (core)

- createNominatimProvider(options)
- useAddressSearch(options)
- distanceMeters(a, b)
- Types: AddressValue, RegionBias, AddressProvider, etc.

## License

MIT
