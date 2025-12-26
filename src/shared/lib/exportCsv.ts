import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export const exportCsv = async (
    filename: string,
    content: string
) => {
    // 🌐 WEB fallback
    if (Platform.OS === 'web') {
        const blob = new Blob([content], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        return;
    }

    // 📱 NATIVE
    const dir = FileSystem.documentDirectory;

    if (!dir) {
        throw new Error('File system not available');
    }

    const fileUri = dir + filename;

    await FileSystem.writeAsStringAsync(
        fileUri,
        content,
        { encoding: FileSystem.EncodingType.UTF8 }
    );

    if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing not available');
    }

    await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export CSV',
    });
};
