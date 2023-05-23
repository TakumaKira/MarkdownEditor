import { REDIS_KEYS } from "../../constants";
import getClient from "./getClient";
import { getRedisKeyName } from "./utils";

export default class Controller {
  private clientGetter = getClient()
  get client(): ReturnType<typeof getClient>['client'] {
    return this.clientGetter.client
  }

  async saveWsHandshakeToken(sessionId: string, wsHandshakeToken: string): Promise<void> {
    await this.clientGetter.isConnecting
    await this.client.set(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken), sessionId)
  }

  async removeWsHandshakeToken(sessionId: string): Promise<void> {
    await this.clientGetter.isConnecting
    const sessionStr = await this.client.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId))
    if (sessionStr === null) return
    const session: Express.Request['session'] = JSON.parse(sessionStr)
    if (session.wsHandshakeToken === undefined) return
    await this.client.del(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, session.wsHandshakeToken))
  }

  async getSession(wsHandshakeToken: string): Promise<Express.Request['session'] | null> {
    await this.clientGetter.isConnecting
    const sessionId = await this.client.get(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken))
    if (sessionId === null) return null
    const sessionStr = await this.client.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId))
    if (sessionStr === null) return null
    const session: Express.Request['session'] = JSON.parse(sessionStr)
    return session
  }

  destroy() {
    return this.client.quit()
  }
}
