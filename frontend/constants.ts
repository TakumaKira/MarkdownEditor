// TODO: Want to share these with api

export const AUTH_TOKEN_KEY = 'x-auth-token'

export const API_PATHS = {
  path: '/api', dir: '/api',
  AUTH: {
    path: '/api/auth', dir: '/auth',
    SIGNUP: {
      path: '/api/auth/signup', dir: '/signup',
    },
    CONFIRM_SIGNUP_EMAIL: {
      path: '/api/auth/confirm-signup-email', dir: '/confirm',
    },
    LOGIN: {
      path: '/api/auth/login', dir: '/login',
    },
    EDIT: {
      path: '/api/auth/edit', dir: '/edit',
    },
    CONFIRM_CHANGE_EMAIL: {
      path: '/api/auth/confirm-change-email', dir: '/edit',
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
