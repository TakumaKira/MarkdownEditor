export const SESSION_SID_KEY = 'connect.sid'
export const WS_HANDSHAKE_TOKEN_KEY = 'ws-handshake-token'
/** 1 week in milliseconds */
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000
export const DOCUMENT_UPDATED_WS_EVENT = 'documents_updated'
export const DOCUMENT_NAME_LENGTH_LIMIT = 50
export const DOCUMENT_CONTENT_LENGTH_LIMIT = 20000
export const EMAIL_LENGTH_MAX = 50
export const MIN_PASSWORD_LENGTH = 8

export const REDIS_KEYS = {
  APP: 'mde',
  SESSION: 'session',
  WS_HANDSHAKE_TOKEN: 'ws_hs_token',
} as const

export const API_PATHS = {
  ROOT: {
    path: '/', dir: '/'
  },
  path: '/api', dir: '/api',
  AUTH: {
    path: '/api/auth', dir: '/auth',
    SIGNUP: {
      path: '/api/auth/signup', dir: '/signup',
    },
    CONFIRM_SIGNUP_EMAIL: {
      path: '/api/auth/confirm-signup-email', dir: '/confirm-signup-email',
    },
    LOGIN: {
      path: '/api/auth/login', dir: '/login',
    },
    LOGOUT: {
      path: '/api/auth/logout', dir: '/logout',
    },
    EDIT: {
      path: '/api/auth/edit', dir: '/edit',
    },
    CONFIRM_CHANGE_EMAIL: {
      path: '/api/auth/confirm-change-email', dir: '/confirm-change-email',
    },
    RESET_PASSWORD: {
      path: '/api/auth/reset-password', dir: '/reset-password',
    },
    CONFIRM_RESET_PASSWORD: {
      path: '/api/auth/confirm-reset-password', dir: '/confirm-reset-password',
    },
    DELETE: {
      path: '/api/auth/delete', dir: '/delete',
    },
  },
  DOCUMENTS: {
    path: '/api/documents', dir: '/documents',
  },
}
