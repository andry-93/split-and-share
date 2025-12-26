import { NavigationContainer } from '@react-navigation/native';
import { useSettings } from '../../features/settings/SettingsContext';
import {
    lightNavigationTheme,
    darkNavigationTheme,
} from '../../shared/theme/navigationTheme';
import { TabNavigator } from './TabNavigator';

export const RootNavigator = () => {
    const { theme } = useSettings();

    return (
        <NavigationContainer
            theme={
                theme === 'dark'
                    ? darkNavigationTheme
                    : lightNavigationTheme
            }
        >
            <TabNavigator />
        </NavigationContainer>
    );
};
