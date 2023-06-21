import { Buffer } from 'buffer';
import { Chance } from 'chance';

export function fromISOStringToTimestamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}

export function decodeToken<Payload>(token: string): Payload {
  return JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
}

export function getTestEmail(tag: string): string {
  return `${Cypress.env('TESTMAIL_NAMESPACE')}.${tag}@inbox.testmail.app`
}

export function getRandomStrings(length: number): string {
  const chance = new Chance();
  return chance.string({
    length,
    pool: 'abcdefghijklmnopqrstuvwxyz0123456789'
  });
}

export const findUrl = /\b(?:https?:\/\/[^"\s]+|https?:\/\/[^'\s]+)\b/g
