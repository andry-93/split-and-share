import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';
import { Provider } from 'react-redux';

import './src/i18n';
import { SettingsProvider } from '@/features/settings/SettingsContext';
import { AppProvider } from '@/app/AppProvider';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { store } from '@/store';

const AppContent = () => {return (
        <AppProvider>
            <RootNavigator />
        </AppProvider>
    );
};

export default function App() {
    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <SettingsProvider>
                    <AppContent />
                </SettingsProvider>
            </SafeAreaProvider>
        </Provider>
    );
}
