import React, { memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

type BottomPrimaryActionBarProps = {
  bottomInset: number;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryDisabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const BottomPrimaryActionBar = memo(function BottomPrimaryActionBar({
  bottomInset,
  disabled = false,
  label,
  onPress,
  secondaryLabel,
  onSecondaryPress,
  secondaryDisabled = false,
  containerStyle,
}: BottomPrimaryActionBarProps) {
  const theme = useTheme();
  const hasSecondary = Boolean(secondaryLabel && onSecondaryPress);

  return (
    <View
      style={[
        containerStyle,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: Math.max(bottomInset, 12),
        },
      ]}
    >
      <View style={[styles.actionsRow, hasSecondary ? styles.actionsRowDual : null]}>
        {hasSecondary ? (
          <Button
            mode="outlined"
            onPress={onSecondaryPress}
            disabled={secondaryDisabled}
            style={[
              styles.actionButton,
              styles.actionButtonHalf,
              styles.secondaryActionButton,
              { borderColor: theme.colors.error },
            ]}
            textColor={theme.colors.error}
          >
            {secondaryLabel}
          </Button>
        ) : null}
        <Button
          mode="contained"
          onPress={onPress}
          disabled={disabled}
          style={[styles.actionButton, hasSecondary ? styles.actionButtonHalf : null]}
        >
          {label}
        </Button>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  actionsRow: {
    gap: 12,
  },
  actionsRowDual: {
    flexDirection: 'row',
  },
  actionButton: {
    borderRadius: 12,
  },
  actionButtonHalf: {
    flex: 1,
  },
  secondaryActionButton: {
    borderWidth: 1,
  },
});
