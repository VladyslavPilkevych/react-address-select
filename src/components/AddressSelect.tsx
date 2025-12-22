import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  AddressProvider,
  AddressValue,
  LatLon,
  RegionBias,
} from "../types";
import { useAddressSearch } from "../hooks/useAddressSearch";

export type AddressSelectOption = AddressValue & { distanceMeters?: number };

export type AddressSelectProps = {
  provider: AddressProvider;
  value: AddressValue | null;
  onChange: (value: AddressValue | null) => void;

  locale?: string;
  countryCodes?: string[];
  regionBias?: RegionBias;

  origin?: LatLon;

  placeholder?: string;
  disabled?: boolean;

  minChars?: number;
  debounceMs?: number;
  cacheTtlMs?: number;

  renderOption?: (
    opt: AddressSelectOption,
    state: { isActive: boolean; isSelected: boolean }
  ) => React.ReactNode;
  formatDistance?: (meters: number) => string;

  onError?: (err: unknown) => void;
};

const defaultFormatDistance = (meters: number) => {
  if (!Number.isFinite(meters)) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
};

const getKey = (o: AddressValue, i: number) =>
  o.id ?? `${o.provider ?? "p"}:${o.label}:${i}`;

export const AddressSelect = (props: AddressSelectProps) => {
  const {
    provider,
    value,
    onChange,
    locale,
    countryCodes,
    regionBias,
    origin,
    placeholder = "Search address…",
    disabled,
    minChars,
    debounceMs,
    cacheTtlMs,
    renderOption,
    formatDistance = defaultFormatDistance,
    onError,
  } = props;

  const id = useId();
  const listId = `${id}-listbox`;

  const { inputValue, setInputValue, options, isLoading, error } =
    useAddressSearch({
      provider,
      locale,
      countryCodes,
      regionBias,
      origin,
      minChars,
      debounceMs,
      cacheTtlMs,
    });

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!error) return;
    onError?.(error);
  }, [error, onError]);

  const selectedId = useMemo(() => (value?.id ? value.id : null), [value]);

  useEffect(() => {
    if (!isOpen) setActiveIndex(-1);
  }, [isOpen]);

  useEffect(() => {
    if (!options.length) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((i) => {
      if (i >= 0 && i < options.length) return i;
      return 0;
    });
  }, [options.length]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const commit = (opt: AddressValue | null) => {
    onChange(opt);
    setIsOpen(false);
    if (opt) setInputValue(opt.label);
  };

  const onInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const onInputChange = (v: string) => {
    setInputValue(v);
    setIsOpen(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = i < 0 ? 0 : i + 1;
        return next >= options.length ? options.length - 1 : next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = i <= 0 ? 0 : i - 1;
        return next;
      });
      return;
    }

    if (e.key === "Enter") {
      if (!isOpen) return;
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) commit(opt);
      return;
    }
  };

  const defaultRenderOption = (
    opt: AddressSelectOption,
    state: { isActive: boolean; isSelected: boolean }
  ) => {
    const dist =
      typeof opt.distanceMeters === "number"
        ? formatDistance(opt.distanceMeters)
        : null;

    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {opt.label}
        </div>
        {dist ? (
          <div
            style={{
              opacity: state.isSelected ? 1 : 0.75,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {dist}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      style={{
        width: "100%",
        position: "relative",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
        }
        disabled={disabled}
        placeholder={placeholder}
        value={inputValue}
        onFocus={onInputFocus}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.15)",
          outline: "none",
        }}
      />

      {isOpen ? (
        <div
          role="listbox"
          id={listId}
          style={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          }}
        >
          {isLoading ? (
            <div style={{ padding: 12, opacity: 0.8 }}>Loading…</div>
          ) : null}

          {!isLoading &&
          inputValue.trim().length > 0 &&
          options.length === 0 ? (
            <div style={{ padding: 12, opacity: 0.8 }}>No results</div>
          ) : null}

          {options.map((opt, i) => {
            const isActive = i === activeIndex;
            const isSelected = selectedId ? opt.id === selectedId : false;

            return (
              <div
                key={getKey(opt, i)}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(opt)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  background: isActive ? "rgba(0,0,0,0.06)" : "transparent",
                }}
              >
                {renderOption
                  ? renderOption(opt, { isActive, isSelected })
                  : defaultRenderOption(opt, { isActive, isSelected })}
              </div>
            );
          })}

          <div
            style={{
              padding: "10px 12px",
              opacity: 0.6,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(null)}
              style={{
                border: "1px solid rgba(0,0,0,0.15)",
                background: "white",
                borderRadius: 10,
                padding: "8px 10px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
