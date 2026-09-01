import { useEffect, useState } from 'react';

/**
 * Delays updating the debounced value until a specified delay passes.
 * Ideal for search bars, autocomplete inputs, and fast filter triggers.
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
