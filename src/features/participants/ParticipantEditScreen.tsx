import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
    TextInput,
    Button,
    Avatar,
    Text,
    useTheme,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { useParticipants } from './useParticipants';
import { ParticipantsStackParamList } from '@/app/navigation/types';

type Props = {
    route: RouteProp<
        ParticipantsStackParamList,
        'ParticipantEdit'
    >;
};

export const ParticipantEditScreen = ({ route }: Props) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const { t } = useTranslation();

    const { participantId } = route.params ?? {};

    const {
        participants,
        createParticipant,
        updateParticipant,
    } = useParticipants();

    const participant = participants.find(
        p => p.id === participantId
    );

    const isEdit = Boolean(participant);

    /* =======================
       STATE
       ======================= */

    const [name, setName] = useState('');
    const [avatarUri, setAvatarUri] = useState<
        string | undefined
    >(undefined);

    /* =======================
       INIT
       ======================= */

    useEffect(() => {
        if (participant) {
            setName(participant.name);
            setAvatarUri(participant.avatarUri);
        }
    }, [participant]);

    /* =======================
       AVATAR PICKER
       ======================= */

    const pickAvatar = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') return;

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes:
                ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const removeAvatar = () => {
        setAvatarUri(undefined);
    };

    /* =======================
       SAVE
       ======================= */

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;

        if (participant) {
            await updateParticipant(participant.id, {
                name: trimmed,
                avatarUri,
            });
        } else {
            await createParticipant(trimmed, avatarUri);
        }

        // ✅ ВСЕГДА выходим из редактирования
        navigation.goBack();
    };

    /* =======================
       RENDER
       ======================= */

    return (
        <>
            <ScreenHeader
                title={
                    isEdit
                        ? t('edit_participant')
                        : t('new_participant')
                }
                showBack
                onBack={() => navigation.goBack()}
            />

            <View style={{ padding: 24 }}>
                {/* ===== AVATAR ===== */}
                <View
                    style={{
                        alignItems: 'center',
                        marginBottom: 24,
                    }}
                >
                    <TouchableOpacity onPress={pickAvatar}>
                        {avatarUri ? (
                            <Avatar.Image
                                size={96}
                                source={{ uri: avatarUri }}
                            />
                        ) : (
                            <Avatar.Text
                                size={96}
                                label={name ? name[0] : '?'}
                            />
                        )}
                    </TouchableOpacity>

                    <Text
                        variant="bodySmall"
                        style={{
                            color: colors.primary,
                            marginTop: 8,
                        }}
                        onPress={pickAvatar}
                    >
                        {t('change_avatar')}
                    </Text>

                    {avatarUri && (
                        <Text
                            variant="bodySmall"
                            style={{
                                color: colors.error,
                                marginTop: 4,
                            }}
                            onPress={removeAvatar}
                        >
                            {t('remove_avatar')}
                        </Text>
                    )}
                </View>

                {/* ===== NAME ===== */}
                <TextInput
                    label={t('name')}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />

                {/* ===== SAVE ===== */}
                <Button
                    mode="contained"
                    style={{ marginTop: 32 }}
                    onPress={handleSave}
                    disabled={!name.trim()}
                >
                    {t('save')}
                </Button>
            </View>
        </>
    );
};
