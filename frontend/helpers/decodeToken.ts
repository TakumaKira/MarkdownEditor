import { Buffer } from 'buffer';

export default function decodeToken<Payload>(token: string): Payload {
  return JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
}
