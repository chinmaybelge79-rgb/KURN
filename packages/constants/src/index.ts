export const KURN_COLORS = {
  background: '#FFFFFF',
  ink: '#111315',
  muted: '#777E83',
  accent: '#D9F0E0',
  border: '#E8ECEA',
  danger: '#B42318',
} as const;

export const API_VERSION = '/api/v1';
export const USER_ROLES = ['CONSUMER', 'GYM_OWNER', 'TRAINER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];
