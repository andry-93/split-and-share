import { useCallback, useMemo, useState } from 'react';

export function useMessageState(initialMessage = '') {
  const [message, setMessage] = useState(initialMessage);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  const visible = useMemo(() => message.length > 0, [message]);

  return {
    message,
    setMessage,
    clearMessage,
    visible,
  };
}
