import { REDIS_KEYS } from "../../constants";
import getClient from "./getClient";
import { getRedisKeyName } from "./utils";

export default class Controller {
  private client: ReturnType<typeof getClient> = getClient()

  async saveWsHandshakeToken(sessionId: string, wsHandshakeToken: string): Promise<void> {
    await this.client.set(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken), sessionId)
  }

  async removeWsHandshakeToken(sessionId: string): Promise<void> {
    const sessionStr = await this.client.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId))
    if (sessionStr === null) return
    const session: Express.Request['session'] = JSON.parse(sessionStr)
    if (session.wsHandshakeToken === undefined) return
    await this.client.del(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, session.wsHandshakeToken))
  }

  async getSession(wsHandshakeToken: string): Promise<Express.Request['session'] | null> {
    const sessionId = await this.client.get(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken))
    if (sessionId === null) return null
    const sessionStr = await this.client.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId))
    if (sessionStr === null) return null
    const session: Express.Request['session'] = JSON.parse(sessionStr)
    return session
  }
}
