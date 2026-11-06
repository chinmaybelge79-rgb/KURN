import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
export const API_BASE_URL = (runtimeEnv?.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');

let accessToken: string | null = null;
let currentUser: MobileUser | null = null;
const SESSION_KEY = 'kurn.session.v1';

function readWebSession() {
  if (Platform.OS !== 'web' || typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage.getItem(SESSION_KEY);
}

function writeSession(value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SESSION_KEY, value);
    return;
  }
  void SecureStore.setItemAsync(SESSION_KEY, value);
}

function removeSession() {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  if (typeof SecureStore.deleteItemAsync === 'function') {
    void SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export type MobileRole = 'CONSUMER' | 'GYM_OWNER' | 'TRAINER' | 'ADMIN';
export type MobileUser = { id: string; phone: string; fullName: string; role: MobileRole; city?: string; state?: string; createdAt: string };
export type ApiEnvelope<T> = { success: boolean; message: string; data: T; error?: { code: string; details?: unknown } };

export function setSession(token: string, user: MobileUser) {
  accessToken = token;
  currentUser = user;
  writeSession(JSON.stringify({ token, user }));
}

export function clearSession() {
  accessToken = null;
  currentUser = null;
  removeSession();
}

export async function hydrateSession() {
  try {
    const stored = Platform.OS === 'web' ? readWebSession() : await SecureStore.getItemAsync(SESSION_KEY);
    if (!stored) return false;
    const session = JSON.parse(stored) as { token?: string; user?: MobileUser };
    if (!session.token || !session.user) return false;
    accessToken = session.token;
    currentUser = session.user;
    return true;
  } catch {
    removeSession();
    return false;
  }
}

export function getSession() {
  return { accessToken, currentUser };
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const body = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !body.success) throw new Error(body.message || 'Something went wrong');
  return body.data;
}

export async function logout() {
  try { if (accessToken) await api<null>('/auth/logout', { method: 'POST' }); } finally { clearSession(); }
}
