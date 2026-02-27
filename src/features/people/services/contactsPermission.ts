import { Linking } from 'react-native';
import { reportError } from '@/shared/monitoring/errorReporting';

type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

type ContactsPermissionResponse = {
  status: Exclude<PermissionStatus, 'unavailable'>;
  granted: boolean;
  canAskAgain: boolean;
};

type ContactsModule = {
  getPermissionsAsync: () => Promise<ContactsPermissionResponse>;
  requestPermissionsAsync: () => Promise<ContactsPermissionResponse>;
};

function getContactsModule(): ContactsModule | null {
  try {
    return require('expo-contacts') as ContactsModule;
  } catch {
    return null;
  }
}

export async function getContactsPermissionStatus(): Promise<PermissionStatus> {
  const contacts = getContactsModule();
  if (!contacts) {
    return 'unavailable';
  }

  try {
    const result = await contacts.getPermissionsAsync();
    return result.granted ? 'granted' : result.status;
  } catch (error) {
    reportError(error, {
      scope: 'people.contacts.permission_status',
    });
    return 'unavailable';
  }
}

export async function requestContactsPermission(): Promise<PermissionStatus> {
  const contacts = getContactsModule();
  if (!contacts) {
    return 'unavailable';
  }

  try {
    const current = await contacts.getPermissionsAsync();
    if (current.granted) {
      return 'granted';
    }

    if (!current.canAskAgain) {
      await Linking.openSettings();
      return 'denied';
    }

    const next = await contacts.requestPermissionsAsync();
    if (next.granted) {
      return 'granted';
    }

    if (!next.canAskAgain) {
      await Linking.openSettings();
    }
    return next.status;
  } catch (error) {
    reportError(error, {
      scope: 'people.contacts.permission_request',
    });
    return 'unavailable';
  }
}
