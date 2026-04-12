import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { settingsActions } from '@/state/settings/settingsSlice';
import { selectSettingsState } from '@/state/settings/settingsSelectors';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { IPhonePicker } from '../components/IPhonePicker';
import { SUPPORTED_LANGUAGE_OPTIONS, normalizeLanguageCode } from '@/state/settings/languageCatalog';

export const OnboardingLanguageStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettingsState);
  const [selectedLang, setSelectedLang] = useState(normalizeLanguageCode(settings.language));

  const handleNext = () => {
    onNext();
  };

  return (
    <OnboardingLayout
      image={require('../../../../assets/onboarding/language.jpg')}
      title={t('onboarding.language.title', 'Select Language')}
      description={t('onboarding.language.description', 'Choose your preferred language for the application interface.')}
      onNext={handleNext}
      nextLabel={t('common.next', 'Next')}
    >
      <View style={styles.pickerContainer}>
        <IPhonePicker
          data={SUPPORTED_LANGUAGE_OPTIONS}
          selectedValue={SUPPORTED_LANGUAGE_OPTIONS.find(o => o.value === selectedLang) || SUPPORTED_LANGUAGE_OPTIONS[0]}
          onValueChange={(item) => {
            setSelectedLang(item.value);
            dispatch(settingsActions.setLanguage({ language: item.value }));
            i18n.changeLanguage(item.value.toLowerCase());
          }}
          renderLabel={(item) => item.label}
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
