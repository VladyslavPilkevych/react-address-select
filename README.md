# react-address-select

[![npm version](https://img.shields.io/npm/v/react-address-select.svg)](https://www.npmjs.com/package/react-address-select)
[![npm downloads](https://img.shields.io/npm/dm/react-address-select.svg)](https://www.npmjs.com/package/react-address-select)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://vladyslavpilkevych.github.io/react-address-select/)

A flexible React address autocomplete/select library with pluggable providers, locale/region biasing, and optional distance calculation.

## Features

- Provider-agnostic API (`AddressProvider`)
- Built-in **Nominatim** provider (OpenStreetMap)
- Region biasing (bbox or center + radius)
- Debounced search with caching + request cancelation (AbortController)
- Optional distance calculation from an origin point
- Minimal UI component included (`AddressSelect`)
- Optional `react-select/async` wrapper (subpath export)

## Live demo

**Interactive demo:**  
https://vladyslavpilkevych.github.io/react-address-select/

The demo showcases:
- `AddressSelect` (built-in minimal UI)
- `react-select/async` adapter
- Locale switching (en / de / ua)
- Region biasing and distance calculation

## Install

```bash
npm i react-address-select
```

or

```bash
pnpm add react-address-select
```

## Public API (stable)

### Main entry (`react-address-select`)

**UI**
- `AddressSelect`
- Types: `AddressSelectProps`, `AddressSelectOption`

**Core**
- `useAddressSearch`
- `createAddressSearcher`
- Types: `UseAddressSearchOptions`, `UseAddressSearchResult`, `CreateAddressSearcherOptions`, `AddressSearcher`, `AddressOption`

**Providers**
- `createNominatimProvider`
- Types: `NominatimProviderOptions`

**Utils**
- `distanceMeters`
- `formatDistanceMeters`

**Types**
- `AddressValue`, `AddressComponents`
- `AddressProvider`, `AddressSearchContext`
- `LatLon`, `RegionBias`, `BBox`

### Optional react-select entry (`react-address-select/react-select`)

- `AddressReactSelectAsync`
- Types: `AddressReactSelectAsyncProps`, `AddressReactSelectAsyncOption`

> `react-select` is an **optional peer dependency**. If you don't use the wrapper, you don't need to install `react-select`.

## Quick start (AddressSelect)

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
    radiusMeters: 40_000,
    strict: false,
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

Install `react-select`:

```bash
npm i react-select
```

(or `pnpm add react-select`)

Then:

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

## Headless usage (useAddressSearch)

If you want to build your own UI, you can use the hook:

```tsx
import { useMemo } from "react";
import { createNominatimProvider, useAddressSearch } from "react-address-select";

export function CustomUI() {
  const provider = useMemo(() => createNominatimProvider(), []);

  const { inputValue, setInputValue, options, isLoading } = useAddressSearch({
    provider,
    locale: "en",
    minChars: 3,
    debounceMs: 250,
    cacheTtlMs: 60_000,
    origin: { lat: 48.1486, lon: 17.1077 },
  });

  return (
    <div>
      <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      {isLoading ? <div>Loading…</div> : null}
      <ul>
        {options.map((o) => (
          <li key={o.id ?? o.label}>{o.label}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Locale notes (en / de / ua)

This package forwards `locale` to the provider.

For Nominatim, it is recommended to use IETF language tags (Accept-Language):
- English: `en`
- German: `de`
- Ukrainian: `uk`

## Provider notes (Nominatim / OpenStreetMap)

The built-in provider uses **Nominatim** (OpenStreetMap). Please respect the Nominatim usage policy.
For production workloads, consider using your own instance or a provider with an SLA.

### Browser note

Browsers restrict some headers (like `User-Agent`). If you pass `userAgent` to `createNominatimProvider`, it will only be usable in server-side environments that allow setting this header.

## Demo

This repo contains a `demo/` app (Vite) showcasing:
- `AddressSelect` (minimal UI)
- `AddressReactSelectAsync` (react-select wrapper)
- Locale switching (`en`, `de`, `uk`)

Run it from the repo root:

```bash
pnpm install
pnpm -C demo dev
```

## License

MIT
