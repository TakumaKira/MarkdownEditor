import { REDIS_KEYS } from "../../constants";
import { SessionStorageClient } from "./type";
import { getRedisKeyName } from "./utils";

export default class SessionStorageController {
  constructor(
    private client: SessionStorageClient,
    private clientIsReady: Promise<void>
  ) {}

  async saveWsHandshakeToken(sessionId: string, wsHandshakeToken: string): Promise<void> {
    await this.clientIsReady
    await this.client.set(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken), sessionId)
  }

  async removeWsHandshakeToken(sessionId: string): Promise<void> {
    await this.clientIsReady
    const sessionStr = await this.client.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId))
    if (sessionStr === null) return
    const session: Express.Request['session'] = JSON.parse(sessionStr)
    if (session.wsHandshakeToken === undefined) return
    await this.client.del(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, session.wsHandshakeToken))
  }

  async getSession(wsHandshakeToken: string): Promise<Express.Request['session'] | null> {
    await this.clientIsReady
    const sessionId = await this.client.get(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken))
    if (sessionId === null) return null
    const sessionStr = await this.client.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId))
    if (sessionStr === null) return null
    const session: Express.Request['session'] = JSON.parse(sessionStr)
    return session
  }
}
