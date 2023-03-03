import { Buffer } from 'buffer';

export function fromISOStringToTimestamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

export default function decodeToken<Payload>(token: string): Payload {
  return JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
}
