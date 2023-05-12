declare module 'express-session' {
  interface SessionData {
    userId: string;
    userEmail: string;
    wsHandshakeToken: string;
  }
}

export {};