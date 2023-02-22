const testEmail = `test@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
const testEmail2 = `test2@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
const testPassword = 'test1234'
const testPassword2 = 'test5678'
const testPassword3 = 'test9012'

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

    const testStart = new Date()
    let linkInHtml: string
    let linkInText: string

    it('sends confirmation email with url including token', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-signup-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail}.`)
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail},
        {receivedAfter: testStart}
      ).then(message => {
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

  context('login and logout', () => {
    before(() => {
      cy.logout()
    })
    beforeEach(() => {
      cy.restoreLocalStorage()
    })
    afterEach(() => {
      cy.saveLocalStorage()
    })

    it('can be logged in with registered email and password', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail)
    })

    it('can be logged out', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button')
    })
  })

  context('edit account', () => {
    before(() => {
      cy.task('clearUser', testEmail2)
      cy.restoreLocalStorage()
      cy.login(testEmail, testPassword)
      cy.saveLocalStorage()
    })
    beforeEach(() => {
      cy.restoreLocalStorage()
    })
    afterEach(() => {
      cy.saveLocalStorage()
    })

    it('can change password and can be logged in only with the new password', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Password successfully changed.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
    })

    const testStart2 = new Date()
    let linkInHtml2: string
    let linkInText2: string

    it('sends confirmation email with url including token if email is changed', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail2}.`)
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail2},
        {receivedAfter: testStart2}
      ).then(message => {
        linkInHtml2 = message.html.links[0].href
        linkInText2 = message.text.links[0].href
      })
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      cy.visit(linkInHtml2)
      cy.contains('Please enter your password to confirm new email.')
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully confirmed.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail2)
      cy.task('changeEmail', {from: testEmail2, to: testEmail})
    })

    it('shows success message and gets logged in with new email when accessing sent url in text', () => {
      cy.visit(linkInText2)
      cy.contains('Please enter your password to confirm new email.')
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully confirmed.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail2)
      cy.task('changeEmail', {from: testEmail2, to: testEmail})
    })

    const testStart3 = new Date()
    let linkInHtml3: string
    let linkInText3: string

    it('changes password immediately and sends confirmation email with url including token if asked both change at the same time', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail2)
      cy.getBySel('auth-modal-password-input').type(testPassword3)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword3)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail2}.`)
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail2},
        {receivedAfter: testStart3}
      ).then(message => {
        linkInHtml3 = message.html.links[0].href
        linkInText3 = message.text.links[0].href
      })
      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail)
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()
      // old email/new password is correct here.
      cy.getBySel('auth-modal-email-input').type(testEmail) // old email
      cy.getBySel('auth-modal-password-input').type(testPassword2) // old password
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(testEmail2) // new email
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword3) // new password
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(testEmail) // old email
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      cy.visit(linkInHtml3)
      cy.contains('Please enter your password to confirm new email.')
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword3)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully confirmed.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail2)
      cy.task('changeEmail', {from: testEmail2, to: testEmail})
    })

    it('shows success message and gets logged in with new email when accessing sent url in text', () => {
      cy.visit(linkInText3)
      cy.contains('Please enter your password to confirm new email.')
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword3)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully confirmed.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail2)
      cy.task('changeEmail', {from: testEmail2, to: testEmail})
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
