import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Appbar, IconButton, Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { EventsStackParamList } from '@/navigation/types';
import { AppHeader } from '@/shared/ui/AppHeader';
import { useEventReportPreview } from '@/features/events/hooks/useEventReportPreview';

type EventReportPreviewScreenProps = NativeStackScreenProps<EventsStackParamList, 'EventReportPreview'>;

export function EventReportPreviewScreen({ navigation, route }: EventReportPreviewScreenProps) {
  const theme = useTheme();
  const {
    event,
    pdfUri,
    previewHtml,
    isGenerating,
    snackbarMessage,
    setSnackbarMessage,
    generatePdf,
    handleDownload,
    handleShare,
    handleZoomIn,
    handleZoomOut,
  } = useEventReportPreview({ eventId: route.params.eventId });

  if (!event) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <AppHeader title="Report preview" onBackPress={navigation.goBack} />
        <View style={styles.center}>
          <Text variant="titleMedium">Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <AppHeader
        title={`${event.name} report`}
        onBackPress={navigation.goBack}
        rightSlot={
          <View style={styles.headerActions}>
            <Appbar.Action
              icon="refresh"
              style={styles.headerActionCompact}
              disabled={isGenerating}
              onPress={() => void generatePdf()}
            />
            <Appbar.Action
              icon="download-outline"
              style={styles.headerActionCompact}
              disabled={!pdfUri || isGenerating}
              onPress={() => void handleDownload()}
            />
            <Appbar.Action
              icon="share-variant-outline"
              style={styles.headerActionCompact}
              disabled={!pdfUri || isGenerating}
              onPress={() => void handleShare()}
            />
          </View>
        }
      />
      <View style={styles.content}>
        {previewHtml && !isGenerating ? (
          <View
            style={[
              styles.previewContainer,
              { borderColor: theme.colors.outlineVariant, backgroundColor: '#FFFFFF' },
            ]}
          >
            <WebView
              source={{ html: previewHtml }}
              originWhitelist={['*']}
              style={[styles.previewWebView, { backgroundColor: '#FFFFFF' }]}
              javaScriptEnabled={false}
              domStorageEnabled={false}
              showsVerticalScrollIndicator={false}
            />
            <View
              style={[
                styles.zoomControls,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
              ]}
            >
              <IconButton icon="magnify-minus-outline" size={18} onPress={handleZoomOut} />
              <IconButton icon="magnify-plus-outline" size={18} onPress={handleZoomIn} />
            </View>
          </View>
        ) : null}

        {isGenerating ? (
          <View style={styles.generating}>
            <ActivityIndicator />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Generating PDF...
            </Text>
          </View>
        ) : null}
      </View>

      <Snackbar visible={snackbarMessage.length > 0} onDismiss={() => setSnackbarMessage('')}>
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    gap: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  headerActionCompact: {
    marginHorizontal: -4,
  },
  previewContainer: {
    flex: 1,
    marginTop: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 240,
  },
  previewWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  generating: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoomControls: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
