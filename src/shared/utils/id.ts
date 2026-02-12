import uuid from 'react-native-uuid';

export function createEntityId(prefix: string) {
  return `${prefix}-${String(uuid.v4())}`;
}

