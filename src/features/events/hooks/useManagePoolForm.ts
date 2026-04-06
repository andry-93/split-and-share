import { useCallback, useEffect, useRef, useState } from 'react';

type UseManagePoolFormInput = {
  initialName?: string;
};

export function useManagePoolForm({
  initialName = '',
}: UseManagePoolFormInput) {
  const [name, setName] = useState(initialName);

  const isSaveDisabled = !name.trim();

  const lastInitializedNameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (lastInitializedNameRef.current === initialName) {
      return;
    }
    lastInitializedNameRef.current = initialName;
    setName(initialName);
  }, [initialName]);

  return {
    name,
    setName,
    isSaveDisabled,
  };
}
