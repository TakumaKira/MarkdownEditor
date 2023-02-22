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

export {};
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      getBySel(value: string): Chainable<JQuery<HTMLElement>>

      logout(): Chainable<JQuery<HTMLElement>>
    }
  }
}

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args)
})

Cypress.Commands.add('logout', () => {
  window.localStorage.setItem(
    (frontendAppConfig.extra as ManifestExtra).STATE_STORAGE_KEY_BASE,
    JSON.stringify({email: null, token: null} as UserStateOnAsyncStorage)
  )
})
