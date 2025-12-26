import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = {
    title: string;
    children: React.ReactNode;
};

export const Section = ({ title, children }: Props) => {
    const { colors } = useTheme();

    return (
        <View style={{ marginBottom: 32 }}>
            <Text
                variant="titleMedium"
                style={{ marginBottom: 12 }}
            >
                {title}
            </Text>

            <View
                style={{
                    borderWidth: 1,
                    borderColor: colors.outlineVariant,
                    borderRadius: 12,
                    padding: 12,
                }}
            >
                {children}
            </View>
        </View>
    );
};
