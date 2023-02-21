const testEmail = `test@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
const password = 'test1234'
const testStart = new Date()

describe('auth' , () => {
  context('singup', () => {
    before(() => {
      cy.task('clearUser', testEmail)
      cy.clearLocalStorageSnapshot()
    })
    beforeEach(() => {
      cy.restoreLocalStorage()
    })
    afterEach(() => {
      cy.saveLocalStorage()
    })

    let linkInHtml: string
    let linkInText: string

    it('sends confirmation email with url including token', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-signup-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-password-input').type(password)
      cy.getBySel('auth-modal-password-confirm-input').type(password)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail}.`)

      cy.mailosaurGetMessage(Cypress.env('MAILOSAUR_SERVER_ID'), {
        sentTo: testEmail
      }, {
        receivedAfter: testStart
      }).then(message => {
        linkInHtml = message.html.links[0].href
        linkInText = message.text.links[0].href
      })
    })

    it('shows success message and gets logged in when accessing sent url in html', () => {
      cy.visit(linkInHtml)
      cy.contains('Your email is confirmed successfully.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail)
      cy.task('deactivateUser', testEmail)
    })

    it('shows success message and gets logged in when accessing sent url in text', () => {
      cy.visit(linkInText)
      cy.contains('Your email is confirmed successfully.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail)
    })
  })

  context('login', () => {
    it('can be logged in with registered email and password', () => {

    })
  })

  context('edit account', () => {
    it('can change password and can be logged in only with the new password', () => {

    })

    it('sends confirmation email with url including token if email is changed', () => {

    })

    it('shows success message and gets logged in with new email when accessing sent url', () => {

    })

    it('changes password immediately and email later when confirmed with email if asked both change at the same time', () => {

    })
  })

  context('reset password', () => {
    it('sends confirmation message with url including token if password reset is requested', () => {

    })

    it('shows success message and changes password when accessing sent url', () => {

    })
  })

  context('delete account', () => {
    it('deletes user and its documents', () => {

    })
  })
})
