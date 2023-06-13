import { REDIS_KEYS, SESSION_MAX_AGE } from "../../constants";
import { SessionStorageClient } from "./type";
import { getRedisKeyName } from "./utils";

export default class SessionStorageController {
  constructor(
    private client: SessionStorageClient,
    private clientIsReady: Promise<void>
  ) {}

  async getSession(sessionId: string): Promise<Express.Request['session'] | null> {
    await this.clientIsReady
    const sessionStr = await this.client.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId))
    if (sessionStr === null) return null
    const session: Express.Request['session'] = JSON.parse(sessionStr)
    return session
  }

  async getSessionId(wsHandshakeToken: string): Promise<string | null> {
    await this.clientIsReady
    return await this.client.get(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken))
  }

  async saveWsHandshakeToken(sessionId: string, wsHandshakeToken: string): Promise<void> {
    await this.clientIsReady
    await this.client.set(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken), sessionId)
    await this.client.expire(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken), SESSION_MAX_AGE / 1000)
  }

  async removeWsHandshakeToken(wsHandshakeToken: string): Promise<void> {
    await this.clientIsReady
    await this.client.del(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken))
  }

  /** For debugging */
  async checkAllKeys(message: string): Promise<void> {
    const results: string[] = []
    results.push('')
    results.push(message)
    await this.clientIsReady
    for await (const key of this.client.scanIterator()) {
      const value = await this.client.get(key);
      results.push(`${key} / ${value}`)
    }
    results.push('')
    console.log(results.join('\n'))
  }
}
