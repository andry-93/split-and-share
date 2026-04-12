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

export const OnboardingDebtModeStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const settings = useAppSelector(selectSettingsState);
  const [selectedMode, setSelectedMode] = useState(settings.debtsViewMode);

  const handleNext = () => {
    dispatch(settingsActions.setDebtsViewMode({ debtsViewMode: selectedMode }));
    onNext();
  };

  const modes = [
    {
      id: 'simplified',
      title: t('onboarding.debtMode.simplifiedTitle', 'Simplified'),
      description: t('onboarding.debtMode.simplifiedDesc', 'Combine all debts between people into single totals. Easier to settle up.'),
      icon: 'vector-combine',
    },
    {
      id: 'detailed',
      title: t('onboarding.debtMode.detailedTitle', 'Detailed'),
      description: t('onboarding.debtMode.detailedDesc', 'Keep track of every specific expense and who owes whom for what. Better for transparency.'),
      icon: 'format-list-bulleted',
    },
  ] as const;

  return (
    <OnboardingLayout
      title={t('onboarding.debtMode.title', 'Balance View')}
      description={t('onboarding.debtMode.description', 'Choose how you want to see who owes what.')}
      onNext={handleNext}
      onBack={onBack}
      nextLabel={t('common.next', 'Next')}
      backLabel={t('common.back', 'Back')}
    >
      <View style={styles.grid}>
        {modes.map((mode) => (
          <PremiumPressable
            key={mode.id}
            onPress={() => setSelectedMode(mode.id)}
            style={[
              styles.card,
              {
                backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: selectedMode === mode.id ? theme.colors.primary : (theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                borderWidth: 1.5,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: selectedMode === mode.id ? (theme.dark ? 0.3 : 0.15) : 0,
                shadowRadius: 10,
                elevation: selectedMode === mode.id ? 4 : 0,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[
                styles.iconWrapper, 
                { backgroundColor: selectedMode === mode.id ? (theme.dark ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)') : (theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') }
              ]}>
                <MaterialCommunityIcons 
                  name={mode.icon} 
                  size={24} 
                  color={selectedMode === mode.id ? theme.colors.primary : (theme.dark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')} 
                />
              </View>
              <View style={styles.titleWrapper}>
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.cardTitle, 
                    { color: selectedMode === mode.id ? theme.colors.onBackground : (theme.dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)') }
                  ]}
                >
                  {mode.title}
                </Text>
                <View style={[
                  styles.activeIndicator, 
                  { backgroundColor: selectedMode === mode.id ? theme.colors.primary : (theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)') }
                ]} />
              </View>
            </View>
            <Text variant="bodySmall" style={[styles.cardDesc, { color: theme.dark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)' }]}>
              {mode.description}
            </Text>
          </PremiumPressable>
        ))}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingTop: 12,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4,
  },
  activeIndicator: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
  },
  cardDesc: {
    lineHeight: 18,
    fontSize: 13,
    paddingLeft: 64,
  },
});
