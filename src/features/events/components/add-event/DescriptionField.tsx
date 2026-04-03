import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addEventStyles as styles } from '@/features/events/components/add-event/styles';
import i18n from '@/shared/i18n';

type DescriptionFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const DescriptionField = memo(function DescriptionField({
  value,
  onChangeText,
}: DescriptionFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        {i18n.t('common.description')}
      </Text>
      <OutlinedFieldContainer style={styles.multilineContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          multiline
          placeholder={i18n.t('events.eventDescriptionPlaceholder')}
          style={[styles.multilineField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});
