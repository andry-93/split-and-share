import React from 'react';
import { View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

type Props = {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export const EmptyState = ({
    title,
    description,
    actionLabel,
    onAction,
}: Props) => {
    const { colors } = useTheme();

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 32,
            }}
        >
            <Text
                variant="titleMedium"
                style={{
                    color: colors.onSurfaceVariant,
                    textAlign: 'center',
                }}
            >
                {title}
            </Text>

            {description && (
                <Text
                    variant="bodyMedium"
                    style={{
                        marginTop: 8,
                        color: colors.onSurfaceVariant,
                        textAlign: 'center',
                    }}
                >
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <Button
                    mode="text"
                    onPress={onAction}
                    style={{ marginTop: 16 }}
                >
                    {actionLabel}
                </Button>
            )}
        </View>
    );
};
