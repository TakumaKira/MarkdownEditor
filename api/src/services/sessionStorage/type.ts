import { createClient } from 'redis'

export type SessionStorageClient = ReturnType<typeof createClient>
