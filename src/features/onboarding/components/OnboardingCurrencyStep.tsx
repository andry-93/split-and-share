import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { settingsActions } from '@/state/settings/settingsSlice';
import { selectSettingsState } from '@/state/settings/settingsSelectors';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { IPhonePicker } from '../components/IPhonePicker';
import { SUPPORTED_CURRENCY_CODES, getCurrencySymbol } from '@/shared/utils/currency';

export const OnboardingCurrencyStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettingsState);
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);

  const handleNext = () => {
    dispatch(settingsActions.setCurrency({ currency: selectedCurrency }));
    onNext();
  };

  const currencyOptions = SUPPORTED_CURRENCY_CODES.map(code => {
    const symbol = getCurrencySymbol(code);
    return {
      value: code,
      displayLabel: symbol ? `${code} • ${symbol}` : code
    };
  });

  return (
    <OnboardingLayout
      image={require('../../../../assets/onboarding/currency.jpg')}
      title={t('onboarding.currency.title', 'Default Currency')}
      description={t('onboarding.currency.description', 'Choose the main currency for your events.')}
      onNext={handleNext}
      onBack={onBack}
      nextLabel={t('common.next', 'Next')}
      backLabel={t('common.back', 'Back')}
    >
      <View style={styles.pickerContainer}>
        <IPhonePicker
          data={currencyOptions}
          selectedValue={currencyOptions.find(o => o.value === selectedCurrency) || currencyOptions[0]}
          onValueChange={(item) => setSelectedCurrency(item.value)}
          renderLabel={(item) => item.displayLabel}
          itemHeight={52}
        />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 240,
  },
});
