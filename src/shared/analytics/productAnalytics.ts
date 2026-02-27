export type ProductAnalyticsEventName =
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'group_created'
  | 'group_updated'
  | 'group_deleted'
  | 'expense_created'
  | 'expense_updated'
  | 'expense_deleted'
  | 'event_people_added'
  | 'event_people_removed'
  | 'debt_marked_paid'
  | 'person_created'
  | 'person_updated'
  | 'person_deleted'
  | 'contacts_imported'
  | 'contacts_permission_requested'
  | 'contacts_permission_result'
  | 'report_preview_opened'
  | 'report_preview_failed'
  | 'report_shared'
  | 'report_downloaded';

export type ProductAnalyticsPayload = Record<string, unknown>;

export type ProductAnalyticsEvent = {
  name: ProductAnalyticsEventName;
  payload?: ProductAnalyticsPayload;
  timestamp: string;
};

type ProductAnalyticsReporter = (event: ProductAnalyticsEvent) => void;

let reporter: ProductAnalyticsReporter = (event) => {
  if (__DEV__) {
    // Local default sink; replace with real analytics SDK later.
    console.log('[analytics]', event.name, event.payload ?? {});
  }
};

export function setProductAnalyticsReporter(nextReporter: ProductAnalyticsReporter) {
  reporter = nextReporter;
}

export function trackProductEvent(
  name: ProductAnalyticsEventName,
  payload?: ProductAnalyticsPayload,
) {
  try {
    reporter({
      name,
      payload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] reporter failed', error);
    }
  }
}
