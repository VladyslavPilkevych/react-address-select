import type {
  AddressProvider,
  AddressSearchContext,
  AddressValue,
  LatLon,
  RegionBias,
} from "../types";

export type NominatimProviderOptions = {
  endpoint?: string;
  userAgent?: string;
  email?: string;
};

const buildViewbox = (bbox: [number, number, number, number]) => {
  const [west, south, east, north] = bbox;
  return `${west},${north},${east},${south}`;
};

const inferViewboxFromCenterRadius = (center: LatLon, radiusMeters: number) => {
  const dLat = radiusMeters / 111320;
  const dLon = radiusMeters / (111320 * Math.cos((center.lat * Math.PI) / 180));
  const west = center.lon - dLon;
  const east = center.lon + dLon;
  const south = center.lat - dLat;
  const north = center.lat + dLat;
  return [west, south, east, north] as [number, number, number, number];
};

const regionBiasToParams = (regionBias?: RegionBias) => {
  if (!regionBias || regionBias.type === "none") return {};
  if (regionBias.type === "bbox") {
    return {
      viewbox: buildViewbox(regionBias.bbox),
      bounded: regionBias.strict ? "1" : undefined,
    };
  }
  if (regionBias.type === "centerRadius") {
    const bbox = inferViewboxFromCenterRadius(
      regionBias.center,
      regionBias.radiusMeters
    );
    return {
      viewbox: buildViewbox(bbox),
      bounded: regionBias.strict ? "1" : undefined,
    };
  }
  return {};
};

const normalize = (item: any): AddressValue => {
  const lat = typeof item?.lat === "string" ? Number(item.lat) : undefined;
  const lon = typeof item?.lon === "string" ? Number(item.lon) : undefined;

  const coordinates =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lon === "number" &&
    Number.isFinite(lon)
      ? { lat, lon }
      : undefined;

  const addr = item?.address ?? {};

  const label =
    typeof item?.display_name === "string"
      ? item.display_name
      : typeof item?.name === "string"
      ? item.name
      : "Unknown address";

  const countryCode =
    typeof addr?.country_code === "string"
      ? addr.country_code.toUpperCase()
      : undefined;

  return {
    label,
    id: typeof item?.place_id === "number" ? String(item.place_id) : undefined,
    provider: "nominatim",
    coordinates,
    components: {
      countryCode,
      country: typeof addr?.country === "string" ? addr.country : undefined,
      region: typeof addr?.state === "string" ? addr.state : undefined,
      city:
        typeof addr?.city === "string"
          ? addr.city
          : typeof addr?.town === "string"
          ? addr.town
          : typeof addr?.village === "string"
          ? addr.village
          : undefined,
      postalCode:
        typeof addr?.postcode === "string" ? addr.postcode : undefined,
      street: typeof addr?.road === "string" ? addr.road : undefined,
      houseNumber:
        typeof addr?.house_number === "string" ? addr.house_number : undefined,
    },
    raw: item,
  };
};

export const createNominatimProvider = (
  opts: NominatimProviderOptions = {}
): AddressProvider => {
  const endpoint =
    opts.endpoint ?? "https://nominatim.openstreetmap.org/search";

  const provider: AddressProvider = {
    id: "nominatim",
    search: async (
      query: string,
      ctx: AddressSearchContext & { signal?: AbortSignal }
    ) => {
      const params = new URLSearchParams();
      params.set("q", query);
      params.set("format", "jsonv2");
      params.set("addressdetails", "1");
      params.set("limit", "8");

      if (ctx.locale) params.set("accept-language", ctx.locale);

      if (ctx.countryCodes?.length) {
        params.set(
          "countrycodes",
          ctx.countryCodes.map((c) => c.toLowerCase()).join(",")
        );
      }

      const rb = regionBiasToParams(ctx.regionBias);
      if (rb.viewbox) params.set("viewbox", rb.viewbox);
      if (rb.bounded) params.set("bounded", rb.bounded);

      const headers: Record<string, string> = {};
      if (opts.userAgent) headers["User-Agent"] = opts.userAgent;
      if (opts.email) headers["Referer"] = `mailto:${opts.email}`;

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        method: "GET",
        headers,
        signal: ctx.signal,
      });

      if (!res.ok) {
        throw new Error(`Nominatim error: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as any[];
      if (!Array.isArray(data)) return [];
      return data.map(normalize);
    },
  };

  return provider;
};
