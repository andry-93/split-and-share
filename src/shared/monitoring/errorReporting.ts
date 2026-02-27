export type ErrorReportContext = {
  scope: string;
  message?: string;
  data?: Record<string, unknown>;
};

export type ErrorReporter = (error: unknown, context: ErrorReportContext) => void;

let reporter: ErrorReporter = (error, context) => {
  console.error('[error-report]', context.scope, context.message ?? '', error, context.data ?? {});
};

export function setErrorReporter(nextReporter: ErrorReporter) {
  reporter = nextReporter;
}

export function reportError(error: unknown, context: ErrorReportContext) {
  try {
    reporter(error, context);
  } catch (reportingError) {
    console.error('[error-report] reporter failed', reportingError);
  }
}
