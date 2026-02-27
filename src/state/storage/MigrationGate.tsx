import React, { useEffect, useState } from 'react';
import { runMigrations } from '@/state/storage/migrations';
import { reportError } from '@/shared/monitoring/errorReporting';

export function MigrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      runMigrations();
    } catch (error) {
      reportError(error, {
        scope: 'storage.migrations',
        message: 'Migration gate failed',
      });
    }
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
