import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { settingsActions } from '@/state/settings/settingsSlice';
import { selectSettingsState } from '@/state/settings/settingsSelectors';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { IPhonePicker } from '../components/IPhonePicker';
import { SettingsState } from '@/state/settings/settingsTypes';

export const OnboardingNumberFormatStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettingsState);

  // Default to 'ru' if 'system' was selected, or use current setting if it's already a specific choice
  const initialFormat = settings.numberFormat === 'system' ? 'ru' : settings.numberFormat;
  const [selectedFormat, setSelectedFormat] = useState<SettingsState['numberFormat']>(initialFormat);

  const handleNext = () => {
    dispatch(settingsActions.setNumberFormat({ numberFormat: selectedFormat }));
    onNext();
  };

  const formatOptions: { value: SettingsState['numberFormat']; label: string }[] = [
    { value: 'us', label: '1,234.56 (US)' },
    { value: 'eu', label: '1.234,56 (EU)' },
    { value: 'ru', label: '1 234,56 (RU)' },
    { value: 'ch', label: '1\'234.56 (CH)' },
  ];

  return (
    <OnboardingLayout
      image={require('../../../../assets/onboarding/numbers.jpg')}
      title={t('onboarding.numberFormat.title', 'Number Format')}
      description={t('onboarding.numberFormat.description', 'Choose how you want your amounts and prices to be displayed.')}
      onNext={handleNext}
      onBack={onBack}
      nextLabel={t('common.next', 'Next')}
      backLabel={t('common.back', 'Back')}
    >
      <View style={styles.pickerContainer}>
        <IPhonePicker
          data={formatOptions}
          selectedValue={formatOptions.find(o => o.value === selectedFormat) || formatOptions[2]}
          onValueChange={(item) => setSelectedFormat(item.value)}
          renderLabel={(item) => item.label}
          itemHeight={64}
        />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -20,
    minHeight: 300,
  },
});
