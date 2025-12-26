import {
    DefaultTheme as NavigationDefaultTheme,
    DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';

import { lightTheme, darkTheme } from './themes';

export const lightNavigationTheme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        primary: lightTheme.colors.primary,
        background: lightTheme.colors.background,
        card: lightTheme.colors.surface,
        text: lightTheme.colors.onSurface,
        border: lightTheme.colors.outline,
    },
};

export const darkNavigationTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        primary: darkTheme.colors.primary,
        background: darkTheme.colors.background,
        card: darkTheme.colors.surface,
        text: darkTheme.colors.onSurface,
        border: darkTheme.colors.outline,
    },
};
