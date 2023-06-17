declare module 'express-session' {
  interface SessionData {
    userId: string;
    wsHandshakeToken: string;
  }
}

export {};