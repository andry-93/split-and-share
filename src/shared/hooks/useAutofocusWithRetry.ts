import { useCallback, useEffect } from 'react';
import { InteractionManager, Platform } from 'react-native';

type FocusableRef = {
  current: { focus?: () => void } | null;
};

type UseAutofocusWithRetryParams = {
  ref: FocusableRef;
  enabled: boolean;
};

export function useAutofocusWithRetry({ ref, enabled }: UseAutofocusWithRetryParams) {
  const focus = useCallback(() => {
    ref.current?.focus?.();
  }, [ref]);

  const focusWithRetry = useCallback(() => {
    requestAnimationFrame(focus);
  }, [focus]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interaction = InteractionManager.runAfterInteractions(focus);
    const timerShort = setTimeout(focus, 120);
    const timerLong = setTimeout(focus, 280);
    const timerAndroid = Platform.OS === 'android' ? setTimeout(focus, 520) : null;

    return () => {
      interaction.cancel();
      clearTimeout(timerShort);
      clearTimeout(timerLong);
      if (timerAndroid) {
        clearTimeout(timerAndroid);
      }
    };
  }, [enabled, focus]);

  return { focusWithRetry };
}
