import { useCallback, useState } from 'react';

export function useConfirmState(initialVisible = false) {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const open = useCallback(() => {
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    open,
    close,
    setIsVisible,
  };
}
