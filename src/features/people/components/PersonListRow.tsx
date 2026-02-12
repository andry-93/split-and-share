import React, { ReactNode, memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { getInitialsAvatarColors } from '../../../shared/utils/avatarColors';

type PersonListRowProps = {
  name: string;
  contact?: string;
  withDivider?: boolean;
  rightSlot?: ReactNode;
  onPress?: () => void;
};

export const PersonListRow = memo(function PersonListRow({
  name,
  contact,
  withDivider = false,
  rightSlot,
  onPress,
}: PersonListRowProps) {
  const theme = useTheme();
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const avatarColors = getInitialsAvatarColors(theme.dark);

  const rowStyle = [
    styles.row,
    withDivider
      ? {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.outlineVariant,
        }
      : null,
  ];

  const content = (
    <>
      <View style={styles.identity}>
        <Avatar.Text
          size={40}
          label={initials || '?'}
          style={[styles.avatar, { backgroundColor: avatarColors.backgroundColor }]}
          color={avatarColors.labelColor}
        />
        <View style={styles.textWrap}>
          <Text variant="titleMedium">{name}</Text>
          {contact ? <Text variant="bodyMedium">{contact}</Text> : null}
        </View>
      </View>
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </>
  );

  if (!onPress) {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        rowStyle,
        pressed ? { backgroundColor: theme.colors.surfaceVariant } : null,
      ]}
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  avatar: {
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  rightSlot: {
    flexShrink: 0,
  },
});
