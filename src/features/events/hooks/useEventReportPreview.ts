import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useEventsState } from '@/state/events/eventsContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import {
  selectDetailedDebts,
  selectEffectiveRawDebts,
  selectPayments,
  selectRawDebts,
  selectSimplifiedDebts,
} from '@/state/events/eventsSelectors';
import { getCurrencyDisplay } from '@/shared/utils/currency';
import { buildEventReportHtml } from '@/features/events/utils/eventReport';
import { getLanguageLocale } from '@/state/settings/languageCatalog';

const PDF_GENERATION_TIMEOUT_MS = 15000;

function sanitizeFileName(input: string) {
  return input.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
}

type UseEventReportPreviewInput = {
  eventId: string;
};

export function useEventReportPreview({ eventId }: UseEventReportPreviewInput) {
  const settings = useSettingsState();
  const eventsState = useEventsState();
  const { events } = eventsState;

  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [zoomScale, setZoomScale] = useState(1);

  const event = useMemo(() => events.find((item) => item.id === eventId), [eventId, events]);
  const fileName = useMemo(
    () => `${sanitizeFileName(event?.name ?? 'event')}-report.pdf`,
    [event?.name],
  );

  const previewHtml = useMemo(() => {
    if (!reportHtml) {
      return null;
    }
    const widthPercent = 100 / zoomScale;
    const zoomStyle = `<style>body{transform:scale(${zoomScale});transform-origin:top left;width:${widthPercent}%;}</style>`;
    return reportHtml.replace('</head>', `${zoomStyle}</head>`);
  }, [reportHtml, zoomScale]);

  const generatePdf = useCallback(async () => {
    if (!event) {
      return;
    }

    setIsGenerating(true);
    setSnackbarMessage('');
    try {
      const currencyCode = getCurrencyDisplay(event.currency ?? settings.currency);
      const rawDebts = selectRawDebts(event);
      const payments = selectPayments(eventsState, event.id);
      const effectiveRawDebts = selectEffectiveRawDebts(rawDebts, payments);
      const detailedDebts = selectDetailedDebts(effectiveRawDebts);
      const simplifiedDebts = selectSimplifiedDebts(effectiveRawDebts);
      const html = buildEventReportHtml({
        appName: 'Split & Share',
        event,
        currencyCode,
        locale: getLanguageLocale(settings.language),
        debtsMode: settings.debtsViewMode,
        detailedDebts,
        simplifiedDebts,
        payments,
      });
      setReportHtml(html);

      const generationPromise = Print.printToFileAsync({ html });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('PDF generation timeout. Please try again.')),
          PDF_GENERATION_TIMEOUT_MS,
        );
      });
      const file = await Promise.race([generationPromise, timeoutPromise]);
      setPdfUri(file.uri);
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to generate PDF report.');
    } finally {
      setIsGenerating(false);
    }
  }, [event, eventsState, settings.currency, settings.debtsViewMode, settings.language]);

  useEffect(() => {
    if (!pdfUri && !isGenerating) {
      void generatePdf();
    }
  }, [generatePdf, isGenerating, pdfUri]);

  const handleShare = useCallback(async () => {
    if (!pdfUri) {
      return;
    }
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      setSnackbarMessage('Sharing is not available on this device.');
      return;
    }
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share event report',
      UTI: 'com.adobe.pdf',
    });
  }, [pdfUri]);

  const handleDownload = useCallback(async () => {
    if (!pdfUri) {
      return;
    }

    try {
      if (FileSystem.documentDirectory) {
        const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: pdfUri,
          to: destinationUri,
        });
        setSnackbarMessage('PDF saved to app documents.');
      } else {
        setSnackbarMessage('Unable to access local storage.');
      }
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to save PDF.');
    }
  }, [fileName, pdfUri]);

  const handleZoomIn = useCallback(() => {
    setZoomScale((prev) => Math.min(1.8, Number((prev + 0.1).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale((prev) => Math.max(0.7, Number((prev - 0.1).toFixed(2))));
  }, []);

  return {
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
  };
}
