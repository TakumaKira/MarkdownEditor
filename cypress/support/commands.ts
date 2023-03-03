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

import { UserStateOnAsyncStorage } from "../../frontend/store/models/user";
import * as frontendAppConfig from '../../frontend/app.config';
import { ManifestExtra } from "../../frontend/app.config.manifestExtra";
import { API_PATHS, AUTH_TOKEN_KEY } from "../../frontend/constants";
import { DocumentStateOnAsyncStorage } from "../../frontend/store/models/document";
import { DocumentsUpdateRequest, DocumentsUpdateResponse } from '@api/document';

export {};
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      getBySel(value: string): Chainable<JQuery<HTMLElement>>

      setLoginTokenOnAsyncStorage(email: string, password: string): Chainable<JQuery<HTMLElement>>
      removeLoginTokenFromAsyncStorage(): Chainable<JQuery<HTMLElement>>

      setDocumentStateOnAsyncStorage(documentStateOnAsyncStorage: DocumentStateOnAsyncStorage): Chainable<JQuery<HTMLElement>>

      updateDocuments(email: string, password: string, documentsUpdateRequest: DocumentsUpdateRequest): Chainable<JQuery<HTMLElement>>

      retrieveDestinationURLFromSendGridRedirectURL(sendGridRedirectURL: string): Chainable<string>
    }
  }
}

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args)
})

Cypress.Commands.add('setLoginTokenOnAsyncStorage', (email, password) => {
  cy.request<{message: string, token: string}>({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}${API_PATHS.AUTH.LOGIN.path}`,
    body: {email, password}
  })
  .then(resp =>
    window.localStorage.setItem(
      `${(frontendAppConfig.extra as ManifestExtra).STATE_STORAGE_KEY_BASE}_user`,
      JSON.stringify({email, token: resp.body.token} as UserStateOnAsyncStorage)
    )
  )
})
Cypress.Commands.add('removeLoginTokenFromAsyncStorage', () => {
  window.localStorage.setItem(
    `${(frontendAppConfig.extra as ManifestExtra).STATE_STORAGE_KEY_BASE}_user`,
    JSON.stringify({email: null, token: null} as UserStateOnAsyncStorage)
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
  .then(resp =>
    cy.request<DocumentsUpdateResponse>({
      method: 'POST',
      url: `${Cypress.env('API_BASE_URL')}${API_PATHS.DOCUMENTS.path}`,
      headers: {
        [AUTH_TOKEN_KEY]: resp.body.token,
      },
      body: documentsUpdateRequest
    })
  )
})

Cypress.Commands.add('retrieveDestinationURLFromSendGridRedirectURL', sendGridRedirectURL => {
  cy.request({
    url: sendGridRedirectURL,
    followRedirect: false,
  }).then(resp => {
    return resp.headers.location;
  });
})
