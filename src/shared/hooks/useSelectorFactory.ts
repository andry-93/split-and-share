import { useRef } from 'react';

export function useSelectorFactory<T>(factory: () => T): T {
  const factoryRef = useRef<T | null>(null);

  if (factoryRef.current === null) {
    factoryRef.current = factory();
  }

  return factoryRef.current;
}
