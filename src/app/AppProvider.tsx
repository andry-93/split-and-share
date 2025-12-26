import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import { BottomSheetProvider } from '../shared/ui/bottom-sheet/BottomSheetProvider';
import { lightTheme, darkTheme } from '../shared/theme/themes';
import { useSettings } from '../features/settings/SettingsContext';

export const AppProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { theme } = useSettings();

    return (
        <PaperProvider
            theme={theme === 'dark' ? darkTheme : lightTheme}
        >
            <BottomSheetProvider>
                {children}
            </BottomSheetProvider>
        </PaperProvider>
    );
};
