import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { peopleActions } from '@/state/people/peopleSlice';
import { selectPeopleState } from '@/state/people/peopleSelectors';
import { OnboardingLayout } from '../components/OnboardingLayout';

export const OnboardingMeStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const peopleState = useAppSelector(selectPeopleState);
  const me = peopleState.people.find(p => p.isMe) || peopleState.people[0];

  const [name, setName] = useState(me?.name !== 'Me' ? me?.name : '');
  const [phone, setPhone] = useState(me?.phone || '');
  const [email, setEmail] = useState(me?.email || '');

  const handleNext = () => {
    if (!name.trim()) return;

    dispatch(peopleActions.updatePerson({
      id: me.id,
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    }));
    onNext();
  };

  const inputTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      background: theme.colors.background,
    }
  };

  return (
    <OnboardingLayout
      image={require('../../../../assets/onboarding/contact.jpg')}
      title={t('onboarding.me.title', 'About You')}
      description={t('onboarding.me.description', 'How should others see you? This information will be used for your profile.')}
      onNext={handleNext}
      onBack={onBack}
      nextLabel={t('common.next', 'Next')}
      backLabel={t('common.back', 'Back')}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            placeholder={t('people.name', 'Name')}
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }]}
            theme={inputTheme}
            outlineColor={theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onBackground}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
          <TextInput
            placeholder={t('people.phone', 'Phone')}
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }]}
            theme={inputTheme}
            keyboardType="phone-pad"
            outlineColor={theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onBackground}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
          <TextInput
            placeholder={t('people.email', 'Email')}
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }]}
            theme={inputTheme}
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor={theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onBackground}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  form: {
    gap: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  input: {
    borderRadius: 16,
  },
});
