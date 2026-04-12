import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { settingsActions } from '@/state/settings/settingsSlice';
import { selectSettingsState } from '@/state/settings/settingsSelectors';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { PremiumPressable } from '@/shared/ui/PremiumPressable';

export const OnboardingThemeStep: React.FC<{ onDone: () => void; onBack: () => void }> = ({ onDone, onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const settings = useAppSelector(selectSettingsState);
  const [selectedTheme, setSelectedTheme] = useState(settings.theme);

  const handleThemeChange = (themeId: 'light' | 'dark' | 'system') => {
    setSelectedTheme(themeId);
    dispatch(settingsActions.setTheme({ theme: themeId }));
  };

  const themes = [
    {
      id: 'light',
      label: t('onboarding.appearance.light', 'Light'),
      icon: 'white-balance-sunny',
    },
    {
      id: 'dark',
      label: t('onboarding.appearance.dark', 'Dark'),
      icon: 'moon-waning-crescent',
    },
    {
      id: 'system',
      label: t('onboarding.appearance.system', 'System'),
      icon: 'cellphone-cog',
    },
  ] as const;

  return (
    <OnboardingLayout
      image={require('../../../../assets/onboarding/appearance.png')}
      title={t('onboarding.appearance.title', 'Appearance')}
      description={t('onboarding.appearance.description', 'Choose how the application should look.')}
      onNext={onDone}
      onBack={onBack}
      nextLabel={t('common.done', 'Done')}
      backLabel={t('common.back', 'Back')}
    >
      <View style={styles.grid}>
        {themes.map((item) => (
          <PremiumPressable
            key={item.id}
            onPress={() => handleThemeChange(item.id)}
            style={[
              styles.card,
              {
                backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: selectedTheme === item.id ? theme.colors.primary : (theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'),
                borderWidth: 1.5,
              },
            ]}
          >
            <View style={[
              styles.iconWrapper,
              { backgroundColor: selectedTheme === item.id ? (theme.dark ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)') : (theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') }
            ]}>
              <MaterialCommunityIcons 
                name={item.icon} 
                size={28} 
                color={selectedTheme === item.id ? theme.colors.primary : (theme.dark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')} 
              />
            </View>
            <Text 
              variant="labelLarge" 
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.label, 
                { color: selectedTheme === item.id ? theme.colors.onBackground : (theme.dark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)') }
              ]}
            >
              {item.label}
            </Text>
            {/* Blue dot marker removed per user request */}
          </PremiumPressable>
        ))}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  card: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
});
