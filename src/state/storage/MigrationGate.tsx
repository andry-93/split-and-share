import React, { useEffect, useState } from 'react';
import { runMigrations } from '@/state/storage/migrations';

export function MigrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    runMigrations();
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
