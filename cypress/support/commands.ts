// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import * as frontendAppConfig from '../../frontend/app.config';
import { ManifestExtra } from "../../frontend/app.config.manifestExtra";
import { API_PATHS, HEADER_WS_HANDSHAKE_TOKEN_KEY } from "../../frontend/constants";
import { DocumentStateOnAsyncStorage } from "../../frontend/store/models/document";
import { DocumentsUpdateRequest, DocumentsUpdateResponse } from '@api/document';
import { UserStateOnAsyncStorage } from '../../frontend/store/models/user';

export {};
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      getBySel(value: string): Chainable<JQuery<HTMLElement>>

      login(email: string, password: string): Chainable<void>

      setDocumentStateOnAsyncStorage(documentStateOnAsyncStorage: DocumentStateOnAsyncStorage): Chainable<void>

      updateDocuments(email: string, password: string, documentsUpdateRequest: DocumentsUpdateRequest): Chainable<void>

      retrieveDestinationURLFromSendGridRedirectURL(sendGridRedirectURL: string): Chainable<string>

      getMessageSent(tag: string, receivedAfter: number): Chainable<Inbox>
    }
  }
}

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args)
})

Cypress.Commands.add('login', (email, password) => {
  cy.session(
    [email, password],
    () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_BASE_URL')}${API_PATHS.AUTH.LOGIN.path}`,
        body: { email, password },
      }).then(res => {
        expect(res.status).to.be.eq(200)
        window.localStorage.setItem(
          `${(frontendAppConfig.extra as ManifestExtra).STATE_STORAGE_KEY_BASE}_user`,
          JSON.stringify({email, wsHandshakeToken: res.headers[HEADER_WS_HANDSHAKE_TOKEN_KEY]} as UserStateOnAsyncStorage)
        )
      })
    },
    {
      validate() {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_BASE_URL')}${API_PATHS.DOCUMENTS.path}`,
          body: { updates: [] } as DocumentsUpdateRequest
        }).then(res => {
          expect(res.status).to.be.eq(200)
          window.localStorage.setItem(
            `${(frontendAppConfig.extra as ManifestExtra).STATE_STORAGE_KEY_BASE}_user`,
            JSON.stringify({email, wsHandshakeToken: res.headers[HEADER_WS_HANDSHAKE_TOKEN_KEY]} as UserStateOnAsyncStorage)
          )
        })
      },
    }
  )
})

Cypress.Commands.add('setDocumentStateOnAsyncStorage', (documentStateOnAsyncStorage: DocumentStateOnAsyncStorage) => {
  window.localStorage.setItem(
    `${(frontendAppConfig.extra as ManifestExtra).STATE_STORAGE_KEY_BASE}_document`,
    JSON.stringify(documentStateOnAsyncStorage)
  )
})

Cypress.Commands.add('updateDocuments', (email, password, documentsUpdateRequest) => {
  cy.request<{message: string, token: string}>({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}${API_PATHS.AUTH.LOGIN.path}`,
    body: {email, password}
  })
    .then(resp => {
      expect(resp.headers['set-cookie']).not.to.be.empty
      cy.request<DocumentsUpdateResponse>({
        method: 'POST',
        url: `${Cypress.env('API_BASE_URL')}${API_PATHS.DOCUMENTS.path}`,
        headers: {
          'set-cookie': resp.headers['set-cookie'],
        },
        body: documentsUpdateRequest
      })
    })
})

Cypress.Commands.add('retrieveDestinationURLFromSendGridRedirectURL', sendGridRedirectURL => {
  cy.request({
    url: sendGridRedirectURL,
    followRedirect: false,
  }).then(resp => {
    return resp.headers.location;
  });
})

const TESTMAIL_ENDPOINT = `https://api.testmail.app/api/json?apikey=${Cypress.env('TESTMAIL_APIKEY')}&namespace=${Cypress.env('TESTMAIL_NAMESPACE')}`;
Cypress.Commands.add('getMessageSent', (tag, receivedAfter) => {
  return cy.request<Inbox>({
    method: 'GET',
    url: `${TESTMAIL_ENDPOINT}&tag=${tag}&timestamp_from=${receivedAfter}&livequery=true`
  }).then(resp => resp.body)
})
