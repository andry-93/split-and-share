export const STORAGE_KEYS = {
  schemaVersion: 'schema_version',
  settings: 'settings',
  people: 'people',
  events: 'events',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

