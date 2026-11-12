import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Session } from '@/types/auth';

const SESSION_KEY = 'guia-cidadao.session';

function getWebStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Persistência segura da sessão (token JWT + dados do usuário)
 * usando o Keychain (iOS) / Keystore (Android) via expo-secure-store,
 * com fallback para localStorage no ambiente Web.
 */
export const sessionStore = {
  async load(): Promise<Session | null> {
    try {
      const raw =
        Platform.OS === 'web'
          ? (getWebStorage()?.getItem(SESSION_KEY) ?? null)
          : await SecureStore.getItemAsync(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },

  async save(session: Session): Promise<void> {
    const serialized = JSON.stringify(session);
    if (Platform.OS === 'web') {
      getWebStorage()?.setItem(SESSION_KEY, serialized);
      return;
    }
    await SecureStore.setItemAsync(SESSION_KEY, serialized);
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      getWebStorage()?.removeItem(SESSION_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
