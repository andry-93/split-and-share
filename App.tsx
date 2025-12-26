import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

import './src/i18n';
import { SettingsProvider } from './src/features/settings/SettingsContext';
import { AppProvider } from './src/app/AppProvider';
import { RootNavigator } from './src/app/navigation/RootNavigator';

const AppContent = () => {return (
        <AppProvider>
            <RootNavigator />
        </AppProvider>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <SettingsProvider>
                <AppContent />
            </SettingsProvider>
        </SafeAreaProvider>
    );
}
