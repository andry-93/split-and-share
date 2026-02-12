import { RefObject, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type BottomSheetRef = RefObject<BottomSheetModal | null>;

export function useDismissBottomSheetsOnBlur(bottomSheetRefs: BottomSheetRef[]) {
  useFocusEffect(
    useCallback(() => {
      return () => {
        bottomSheetRefs.forEach((ref) => {
          ref.current?.dismiss();
        });
      };
    }, [bottomSheetRefs]),
  );
}
