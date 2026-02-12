import React, { ReactNode, memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { getInitialsAvatarColors } from '../../../shared/utils/avatarColors';

type PersonListRowProps = {
  name: string;
  contact?: string;
  metaText?: string;
  muted?: boolean;
  isCurrentUser?: boolean;
  rightSlot?: ReactNode;
  onPress?: () => void;
};

export const PersonListRow = memo(function PersonListRow({
  name,
  contact,
  metaText,
  muted = false,
  isCurrentUser = false,
  rightSlot,
  onPress,
}: PersonListRowProps) {
  const theme = useTheme();
  const currentUserBackground = theme.dark ? 'rgba(147, 180, 255, 0.12)' : 'rgba(37, 99, 255, 0.08)';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const avatarColors = getInitialsAvatarColors(theme.dark);

  const content = (
    <View
      style={[
        styles.content,
        muted ? styles.muted : null,
        isCurrentUser ? [styles.currentUserContent, { backgroundColor: currentUserBackground }] : null,
      ]}
    >
      <View style={styles.identity}>
        <Avatar.Text
          size={40}
          label={initials || '?'}
          style={[styles.avatar, { backgroundColor: avatarColors.backgroundColor }]}
          color={avatarColors.labelColor}
        />
        <View style={styles.textWrap}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium">{name}</Text>
            {isCurrentUser ? (
              <View style={[styles.youBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
                  You
                </Text>
              </View>
            ) : null}
          </View>
          {contact ? <Text variant="bodyMedium">{contact}</Text> : null}
          {metaText ? (
            <Text variant="labelMedium" style={styles.metaText}>
              {metaText}
            </Text>
          ) : null}
        </View>
      </View>
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.row,
        styles.pressableRow,
        pressed ? { backgroundColor: currentUserBackground } : null,
      ]}
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    width: '100%',
  },
  pressableRow: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentUserContent: {
    borderRadius: 10,
  },
  youBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rightSlot: {
    flexShrink: 0,
  },
  muted: {
    opacity: 0.5,
  },
  metaText: {
    marginTop: 4,
  },
});
