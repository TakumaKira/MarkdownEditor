// TODO: Want to share this with frontend

export const AUTH_TOKEN_KEY = 'x-auth-token'

export const API_PATHS = {
  path: '/api', dir: '/api',
  AUTH: {
    path: '/api/auth', dir: '/auth',
    SIGNUP: {
      path: '/api/auth/signup', dir: '/signup',
    },
    LOGIN: {
      path: '/api/auth/login', dir: '/login',
    },
  },
  DOCUMENTS: {
    path: '/api/documents', dir: '/documents',
  },
}
