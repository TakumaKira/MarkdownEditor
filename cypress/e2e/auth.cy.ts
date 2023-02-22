const testEmail1 = `test1@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
const testEmail2 = `test2@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
const testPassword1 = 'test1234'
const testPassword2 = 'test5678'
const testPassword3 = 'test9012'
const testPassword4 = 'test3456'

describe('auth' , () => {
  context('singup', () => {
    before(() => {
      cy.task('clearUser', testEmail1)
      cy.clearLocalStorageSnapshot()
    })
    beforeEach(() => {
      cy.restoreLocalStorage()
    })
    afterEach(() => {
      cy.saveLocalStorage()
    })

    const signupTestStart = new Date()
    let linkInSignupMail: string

    it('sends confirmation email with url including token', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-signup-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail1}.`)
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail1},
        {receivedAfter: signupTestStart}
      ).then(message => {
        expect(message.html.links[0].href).to.equal(message.text.links[0].href)
        linkInSignupMail = message.html.links[0].href
      })
    })

    it('shows success message and gets logged in when accessing sent url in html', () => {
      cy.visit(linkInSignupMail)
      cy.contains('Your email is confirmed successfully.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail1)
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
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail1)
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
      cy.login(testEmail1, testPassword1)
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
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
    })

    const mailChangeTestStart = new Date()
    let linkInMailChangeMail: string

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
        {receivedAfter: mailChangeTestStart}
      ).then(message => {
        expect(message.html.links[0].href).to.equal(message.text.links[0].href)
        linkInMailChangeMail = message.html.links[0].href
      })
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      cy.visit(linkInMailChangeMail)
      cy.contains('Please enter your password to confirm new email.')
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully confirmed.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail2)
      cy.task('changeEmail', {from: testEmail2, to: testEmail1})
    })

    const mailWithPasswordChangeTestStart = new Date()
    let linkInMailWithPasswordChangeMail: string

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
        {receivedAfter: mailWithPasswordChangeTestStart}
      ).then(message => {
        expect(message.html.links[0].href).to.equal(message.text.links[0].href)
        linkInMailWithPasswordChangeMail = message.html.links[0].href
      })
      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()
      // old email/new password is correct here.
      cy.getBySel('auth-modal-email-input').type(testEmail1) // old email
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
      cy.getBySel('auth-modal-email-input').type(testEmail1) // old email
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      cy.visit(linkInMailWithPasswordChangeMail)
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
      cy.task('changeEmail', {from: testEmail2, to: testEmail1})
    })
  })

  context('reset password', () => {
    before(() => {
      cy.restoreLocalStorage()
      cy.logout()
      cy.saveLocalStorage()
    })
    beforeEach(() => {
      cy.restoreLocalStorage()
    })
    afterEach(() => {
      cy.saveLocalStorage()
    })

    const passwordResetTestStart = new Date()
    let linkInPasswordResetMail: string

    it('sends confirmation message with url including token if password reset is requested', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.contains('Forgot password?').click()
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail1}.`)
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail1, subject: 'Markdown: You asked to reset your password.'},
        {receivedAfter: passwordResetTestStart}
      ).then(message => {
        cy.log(message.subject)
        expect(message.html.links[0].href).to.equal(message.text.links[0].href)
        linkInPasswordResetMail = message.html.links[0].href
      })
    })

    it('shows success message and changes password when accessing sent url', () => {
      cy.visit(linkInPasswordResetMail)
      cy.getBySel('auth-modal-password-input').type(testPassword4)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword4)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully set new password.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword3)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword4)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
    })
  })

  context('delete account', () => {
    it('deletes user and its documents', () => {

    })
  })
})
