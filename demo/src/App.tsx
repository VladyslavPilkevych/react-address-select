import { useMemo, useState } from "react";
import type { AddressValue, RegionBias } from "react-address-select";
import { AddressSelect, createNominatimProvider } from "react-address-select";

export const App = () => {
  const provider = useMemo(() => createNominatimProvider(), []);
  const [value, setValue] = useState<AddressValue | null>(null);

  const origin = { lat: 48.1486, lon: 17.1077 };

  const regionBias: RegionBias = {
    type: "centerRadius",
    center: origin,
    radiusMeters: 40_000,
    strict: false
  };

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ margin: "0 0 14px" }}>react-address-select demo</h1>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Provider: Nominatim · Locale: en · Bias: 40km around Bratislava
      </p>

      <AddressSelect
        provider={provider}
        value={value}
        onChange={setValue}
        locale="en"
        origin={origin}
        regionBias={regionBias}
        placeholder="Type an address…"
        onError={(e) => console.error(e)}
      />

      <div style={{ marginTop: 18, padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Selected value</div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(value, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 10, opacity: 0.75 }}>
        Tip: try searching “Main street”, “Bratislava”, “Vienna”, etc.
      </div>
    </div>
  );
};
