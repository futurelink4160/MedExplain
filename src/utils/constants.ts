export const APP_NAME = 'MedExplain';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CHAT: '/chat',
  HISTORY: '/history',
  RESULTS: '/results',
  RESULTS_DEMO: '/results-demo',
  ASK_PHARMACIST: '/ask-pharmacist',
  EVIDENCE: '/evidence',
  CASES: '/cases',
  ADMIN: '/admin',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 30000,
  UPLOAD: 60000,
  LONG_RUNNING: 120000,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully',
  DELETED: 'Deleted successfully',
  UPDATED: 'Updated successfully',
} as const;
