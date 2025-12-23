import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAddressSearch } from "./useAddressSearch";

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("useAddressSearch", () => {
  it("debounces and returns provider results", async () => {
    vi.useFakeTimers();

    const provider = {
      id: "mock",
      search: vi.fn(async (q: string) => [{ label: q, provider: "mock" }])
    };

    const { result } = renderHook(() =>
      useAddressSearch({
        provider,
        minChars: 1,
        debounceMs: 10,
        cacheTtlMs: 1000
      })
    );

    act(() => {
      result.current.setInputValue("abc");
    });

    await act(async () => {
      vi.advanceTimersByTime(20);
      await flushPromises();
    });

    expect(provider.search).toHaveBeenCalledTimes(1);
    expect(result.current.options.length).toBe(1);
    expect(result.current.options[0]?.label).toBe("abc");

    vi.useRealTimers();
  });
});
