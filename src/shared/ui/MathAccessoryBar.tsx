import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type MathAccessoryBarProps = {
  onInsert: (char: string) => void;
};

const OPERATORS = [
  { label: '+', value: '+' },
  { label: '−', value: '-' },
  { label: '×', value: '*' },
  { label: '÷', value: '/' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
];

export const MathAccessoryBar = ({ onInsert }: MathAccessoryBarProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderTopColor: theme.colors.outlineVariant },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        {OPERATORS.map((op) => (
          <Pressable
            key={op.label}
            onPress={() => onInsert(op.value)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed
                  ? theme.colors.primaryContainer
                  : theme.colors.elevation.level3,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: theme.colors.onSurface },
              ]}
            >
              {op.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  scrollContent: {
    gap: 6,
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 22,
  },
});
