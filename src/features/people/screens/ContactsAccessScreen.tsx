import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '../../../navigation/types';

type ContactsAccessScreenProps = NativeStackScreenProps<PeopleStackParamList, 'ImportContactsAccess'>;

export function ContactsAccessScreen({ navigation }: ContactsAccessScreenProps) {
  const theme = useTheme();
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleContinue = useCallback(() => navigation.navigate('ImportContactsPicker'), [navigation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.outlineVariant }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Contacts access" />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon source="account-group" size={32} color={theme.colors.primary} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          Access Your Contacts
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.supporting, { color: theme.colors.onSurfaceVariant }]}
        >
          To import people from your contacts, we&apos;ll need permission to access your contact list.
        </Text>
      </View>

      <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>
        <Button mode="contained" onPress={handleContinue} style={styles.primaryButton}>
          Continue
        </Button>
        <Button mode="outlined" onPress={handleBack} style={styles.secondaryButton}>
          Not now
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  supporting: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
});
