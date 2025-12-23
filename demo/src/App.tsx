import { useMemo, useState } from "react";
import {
  AddressSelect,
  createNominatimProvider,
} from "react-address-select";
import type { AddressValue, RegionBias } from "react-address-select";
import { AddressReactSelectAsync } from 'react-address-select/react-select';

type Mode = "address-select" | "react-select";
type LangUI = "en" | "de" | "uk";

const origin = { lat: 48.1486, lon: 17.1077 };

export const App = () => {
  const provider = useMemo(() => createNominatimProvider(), []);

  const [mode, setMode] = useState<Mode>("address-select");
  const [lang, setLang] = useState<LangUI>("en");

  const [value, setValue] = useState<AddressValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [useBias, setUseBias] = useState(true);
  const [strictBias, setStrictBias] = useState(false);
  const [radiusKm, setRadiusKm] = useState(40);

  const [useOriginDistance, setUseOriginDistance] = useState(true);

  const [minChars, setMinChars] = useState(3);
  const [debounceMs, setDebounceMs] = useState(250);

  const regionBias: RegionBias = useBias
    ? {
        type: "centerRadius",
        center: origin,
        radiusMeters: Math.max(1, radiusKm) * 1000,
        strict: strictBias,
      }
    : { type: "none" };

  const sharedProps = {
    provider,
    value,
    onChange: (v: AddressValue | null) => {
      setValue(v);
      setError(null);
    },
    lang,
    regionBias,
    origin: useOriginDistance ? origin : undefined,
    minChars,
    debounceMs,
  } as const;

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 920,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ margin: 0 }}>react-address-select demo</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Provider: Nominatim (OpenStreetMap) · UI: {mode} · Language: {lang}
      </p>

      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.12)",
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 90 }}>UI</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              <option value="address-select">AddressSelect</option>
              <option value="react-select">react-select</option>
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 90 }}>Language</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangUI)}
              title="For Nominatim Ukrainian uses language tag 'uk'"
            >
              <option value="en">en</option>
              <option value="de">de</option>
              <option value="ua">ua</option>
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={useBias}
              onChange={(e) => setUseBias(e.target.checked)}
            />
            Region bias (center+radius)
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span>Radius</span>
            <input
              type="range"
              min={5}
              max={200}
              value={radiusKm}
              disabled={!useBias}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
            <span style={{ width: 60 }}>{radiusKm} km</span>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={strictBias}
              disabled={!useBias}
              onChange={(e) => setStrictBias(e.target.checked)}
            />
            Strict
          </label>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={useOriginDistance}
              onChange={(e) => setUseOriginDistance(e.target.checked)}
            />
            Show distance from origin (Bratislava)
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span>minChars</span>
            <input
              type="number"
              min={1}
              max={10}
              value={minChars}
              onChange={(e) => setMinChars(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span>debounce</span>
            <input
              type="number"
              min={0}
              max={2000}
              value={debounceMs}
              onChange={(e) => setDebounceMs(Number(e.target.value))}
              style={{ width: 100 }}
            />
            <span>ms</span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setValue(null);
              setError(null);
            }}
            style={{
              border: "1px solid rgba(0,0,0,0.15)",
              background: "white",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            Clear value
          </button>

          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              border: "1px solid rgba(0,0,0,0.15)",
              background: "white",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            Clear error
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {mode === "address-select" ? (
          <AddressSelect
            {...sharedProps}
            placeholder="Type an address…"
            onError={(e) => setError(String(e))}
          />
        ) : (
          <div>
            <AddressReactSelectAsync
              {...sharedProps}
              placeholder="Type an address…"
              onError={(e) => setError(String(e))}
            />
            <div style={{ marginTop: 8, opacity: 0.75, fontSize: 13 }}>
              Tip: react-select wrapper lives at <code>react-address-select/react-select</code>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(220,0,0,0.25)",
            background: "rgba(220,0,0,0.06)",
            color: "rgba(120,0,0,0.95)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Error</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Selected value</div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 10, opacity: 0.75 }}>
        Try: “Main street”, “Bratislava”, “Vienna”, etc.
      </div>
    </div>
  );
};
