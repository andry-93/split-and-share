import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import i18n from '@/shared/i18n';
import { useEventsState } from '@/state/events/eventsContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import {
  selectDetailedDebts,
  selectEffectiveRawDebts,
  selectPayments,
  selectPoolBalanceMap,
  selectRawDebts,
  selectSimplifiedDebts,
} from '@/state/events/eventsSelectors';
import { getCurrencyDisplay } from '@/shared/utils/currency';
import { buildEventReportHtml } from '@/features/events/utils/eventReport';
import { getLanguageLocale } from '@/state/settings/languageCatalog';
import { trackProductEvent } from '@/shared/analytics/productAnalytics';
import { reportError } from '@/shared/monitoring/errorReporting';

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
    trackProductEvent('report_preview_opened', { eventId: event.id });
    try {
      const currencyCode = getCurrencyDisplay(event.currency ?? settings.currency);
      const rawDebts = selectRawDebts(event);
      const payments = selectPayments(eventsState, event.id);
      const effectiveRawDebts = selectEffectiveRawDebts(rawDebts, payments);
      const detailedDebts = selectDetailedDebts(effectiveRawDebts);
      const simplifiedDebts = selectSimplifiedDebts(effectiveRawDebts);
      const poolBalanceMap = selectPoolBalanceMap(event, payments);
      const html = buildEventReportHtml({
        appName: 'Split & Share',
        event,
        currencyCode,
        locale: getLanguageLocale(settings.language),
        debtsMode: settings.debtsViewMode,
        detailedDebts,
        simplifiedDebts,
        payments,
        poolBalanceMap,
      });
      setReportHtml(html);

      const generationPromise = Print.printToFileAsync({ html });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(i18n.t('events.report.generateAgain'))),
          PDF_GENERATION_TIMEOUT_MS,
        );
      });
      const file = await Promise.race([generationPromise, timeoutPromise]);
      setPdfUri(file.uri);
    } catch (error) {
      reportError(error, {
        scope: 'events.report.generate_pdf',
        data: { eventId: event.id },
      });
      trackProductEvent('report_preview_failed', { eventId: event.id });
      setSnackbarMessage(error instanceof Error ? error.message : i18n.t('events.report.generateAgain'));
    } finally {
      setIsGenerating(false);
    }
  }, [event, eventsState, settings.currency, settings.debtsViewMode, settings.language]);

  const prevDepsRef = useRef<string>('');

  useEffect(() => {
    if (!event) return;
    
    // Build a lightweight signature of the data that affects the report
    const signature = JSON.stringify({
      eventId: event.id,
      updatedAt: event.updatedAt,
      paymentsCount: Object.values(eventsState.paymentsByEvent).flat().length,
    });

    if (pdfUri && prevDepsRef.current === signature) return;
    prevDepsRef.current = signature;

    // If data changed after generating a PDF, reset it so it regenerates
    if (pdfUri) {
      setPdfUri(null);
      return;
    }

    if (!isGenerating) {
      void generatePdf();
    }
  }, [generatePdf, isGenerating, pdfUri, event, eventsState.paymentsByEvent]);

  const handleShare = useCallback(async () => {
    if (!pdfUri) {
      return;
    }
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setSnackbarMessage(i18n.t('events.report.useAnotherDeviceToShare'));
        return;
      }
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: i18n.t('events.report.shareDialogTitle'),
        UTI: 'com.adobe.pdf',
      });
      trackProductEvent('report_shared', { eventId });
    } catch (error) {
      reportError(error, {
        scope: 'events.report.share',
        data: { eventId },
      });
      setSnackbarMessage(error instanceof Error ? error.message : i18n.t('events.report.shareAgain'));
    }
  }, [eventId, pdfUri]);

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
        trackProductEvent('report_downloaded', { eventId });
        setSnackbarMessage(i18n.t('events.report.savedToDocuments'));
      } else {
        setSnackbarMessage(i18n.t('events.report.allowStorageAccess'));
      }
    } catch (error) {
      reportError(error, {
        scope: 'events.report.download',
        data: { eventId },
      });
      setSnackbarMessage(error instanceof Error ? error.message : i18n.t('events.report.saveAgain'));
    }
  }, [eventId, fileName, pdfUri]);

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
