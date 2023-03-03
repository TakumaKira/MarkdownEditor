import * as dayjs from 'dayjs'
import { API_PATHS } from '../../frontend/constants'
import decodeToken from "../support/utils"

const testEmail1 = `test1@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
const testEmail2 = `test2@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
const testPassword1 = 'test1234'
const testPassword2 = 'test5678'

describe('auth' , () => {
  context('signup', () => {
    afterEach(() => {
      cy.task('clearUser', testEmail1)
    })

    it('sends confirmation email with url including token', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-signup-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail1}.`)
      const signupTestStart = new Date()
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail1},
        {receivedAfter: signupTestStart}
      ).then(message => {
        let url: URL
        if (message.html.links[0].href?.includes('sendgrid.net')) {
          cy.retrieveDestinationURLFromSendGridRedirectURL(message.html.links[0].href).then(linkInHtml => {
            cy.retrieveDestinationURLFromSendGridRedirectURL(message.text.links[0].href).then(linkInText => {
              expect(linkInHtml).to.equal(linkInText)
              url = new URL(linkInHtml)

              const {origin, pathname, searchParams} = url
              expect(origin).to.equal(Cypress.config().baseUrl)
              expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir)
              const token = searchParams.get('token')
              const payload = decodeToken<any>(token)
              expect(payload.is).to.equal('SignupToken')
              expect(payload.email).to.equal(testEmail1)
              expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
            })
          })
        } else {
          expect(message.html.links[0].href).to.equal(message.text.links[0].href)
          url = new URL(message.html.links[0].href)

          const {origin, pathname, searchParams} = url
          expect(origin).to.equal(Cypress.config().baseUrl)
          expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir)
          const token = searchParams.get('token')
          const payload = decodeToken<any>(token)
          expect(payload.is).to.equal('SignupToken')
          expect(payload.email).to.equal(testEmail1)
          expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
        }
      })
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-login-button').click()

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('This user is not activated.')
  })

    it('shows success message and gets logged in when accessing sent url in html', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: false})
      cy.task('generateSignupToken', testEmail1).then(signupToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir}?token=${signupToken}`)
        cy.contains('Your email is confirmed successfully.')
        cy.getBySel('auth-modal-ok-button').click()
        cy.getBySel('topbar-menu-button').click()
        cy.contains(testEmail1)
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // oldEmail / oldPassword
        cy.getBySel('auth-modal-email-input').type(testEmail1)
        cy.getBySel('auth-modal-password-input').type(testPassword1)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(testEmail1)
      })
    })
  })

  context('login and logout', () => {
    before(() => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
    })
    after(() => {
      cy.task('clearUser', testEmail1)
    })

    it('can be logged in with registered email and password', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
    })

    it('can be logged out', () => {
      cy.setLoginTokenOnAsyncStorage(testEmail1, testPassword1)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button')
    })
  })

  context('edit account', () => {
    afterEach(() => {
      cy.task('clearUser', testEmail1)
      cy.task('clearUser', testEmail2)
    })

    it('can change password and can be logged in only with the new password', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
      cy.setLoginTokenOnAsyncStorage(testEmail1, testPassword1)
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

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // oldEmail / newPassword
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
    })

    it('sends confirmation email with url including token if email is changed', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
      cy.setLoginTokenOnAsyncStorage(testEmail1, testPassword1)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail2}.`)
      const mailChangeTestStart = new Date()
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail2},
        {receivedAfter: mailChangeTestStart}
      ).then(message => {
        let url: URL
        if (message.html.links[0].href?.includes('sendgrid.net')) {
          cy.retrieveDestinationURLFromSendGridRedirectURL(message.html.links[0].href).then(linkInHtml => {
            cy.retrieveDestinationURLFromSendGridRedirectURL(message.text.links[0].href).then(linkInText => {
              expect(linkInHtml).to.equal(linkInText)
              url = new URL(linkInHtml)

              const {origin, pathname, searchParams} = url
              expect(origin).to.equal(Cypress.config().baseUrl)
              expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
              const token = searchParams.get('token')
              const payload = decodeToken<any>(token)
              expect(payload.is).to.equal('EmailChangeToken')
              expect(payload.oldEmail).to.equal(testEmail1)
              expect(payload.newEmail).to.equal(testEmail2)
              expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
            })
          })
        } else {
          expect(message.html.links[0].href).to.equal(message.text.links[0].href)
          url = new URL(message.html.links[0].href)

          const {origin, pathname, searchParams} = url
          expect(origin).to.equal(Cypress.config().baseUrl)
          expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
          const token = searchParams.get('token')
          const payload = decodeToken<any>(token)
          expect(payload.is).to.equal('EmailChangeToken')
          expect(payload.oldEmail).to.equal(testEmail1)
          expect(payload.newEmail).to.equal(testEmail2)
          expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
        }
      })
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()

      // newEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(testEmail2)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
      cy.setLoginTokenOnAsyncStorage(testEmail1, testPassword1)
      cy.task('generateEmailChangeToken', {oldEmail: testEmail1, newEmail: testEmail2}).then(emailChangeToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir}?token=${emailChangeToken}`)
        cy.contains('Please enter your password to confirm new email.')
        cy.getBySel('auth-modal-password-input').type(testPassword1)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully confirmed.')
        cy.getBySel('auth-modal-ok-button').click()
        cy.getBySel('topbar-menu-button').click()
        cy.contains(testEmail2)
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // oldEmail / oldPassword
        cy.getBySel('auth-modal-email-input').type(testEmail1)
        cy.getBySel('auth-modal-password-input').type(testPassword1)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // newEmail / oldPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(testEmail2)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(testEmail2)
      })
    })

    it('changes password immediately and sends confirmation email with url including token if asked both change at the same time', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
      cy.setLoginTokenOnAsyncStorage(testEmail1, testPassword1)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail2)
      cy.getBySel('auth-modal-password-input').type(testPassword2)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword2)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail2}.`)
      const mailWithPasswordChangeTestStart = new Date()
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail2},
        {receivedAfter: mailWithPasswordChangeTestStart}
      ).then(message => {
        let url: URL
        if (message.html.links[0].href?.includes('sendgrid.net')) {
          cy.retrieveDestinationURLFromSendGridRedirectURL(message.html.links[0].href).then(linkInHtml => {
            cy.retrieveDestinationURLFromSendGridRedirectURL(message.text.links[0].href).then(linkInText => {
              expect(linkInHtml).to.equal(linkInText)
              url = new URL(linkInHtml)

              const {origin, pathname, searchParams} = url
              expect(origin).to.equal(Cypress.config().baseUrl)
              expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
              const token = searchParams.get('token')
              const payload = decodeToken<any>(token)
              expect(payload.is).to.equal('EmailChangeToken')
              expect(payload.oldEmail).to.equal(testEmail1)
              expect(payload.newEmail).to.equal(testEmail2)
              expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
            })
          })
        } else {
          expect(message.html.links[0].href).to.equal(message.text.links[0].href)
          url = new URL(message.html.links[0].href)

          const {origin, pathname, searchParams} = url
          expect(origin).to.equal(Cypress.config().baseUrl)
          expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
          const token = searchParams.get('token')
          const payload = decodeToken<any>(token)
          expect(payload.is).to.equal('EmailChangeToken')
          expect(payload.oldEmail).to.equal(testEmail1)
          expect(payload.newEmail).to.equal(testEmail2)
          expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
        }
      })
      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()

      // old email / new password is correct here.

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(testEmail1) // old email
      cy.getBySel('auth-modal-password-input').type(testPassword1) // old password
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // newEmail / newPassword
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(testEmail2) // new email
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(testPassword2) // new password
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // old email / new password
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(testEmail1) // old email
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword2, isActivated: true})
      cy.setLoginTokenOnAsyncStorage(testEmail1, testPassword2)
      cy.task('generateEmailChangeToken', {oldEmail: testEmail1, newEmail: testEmail2}).then(emailChangeToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir}?token=${emailChangeToken}`)
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
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // oldEmail / oldPassword
        cy.getBySel('auth-modal-email-input').type(testEmail1)
        cy.getBySel('auth-modal-password-input').type(testPassword1)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // newEmail / oldPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(testEmail2)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // oldEmail / newPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(testEmail1)
        cy.getBySel('auth-modal-password-input').clear()
        cy.getBySel('auth-modal-password-input').type(testPassword2)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // newEmail / newPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(testEmail2)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(testEmail2)
      })
    })
  })

  context('reset password', () => {
    afterEach(() => {
      cy.task('clearUser', testEmail1)
    })

    it('sends confirmation message with url including token if password reset is requested', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.contains('Forgot password?').click()
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail1}.`)
      const passwordResetTestStart = new Date()
      cy.mailosaurGetMessage(
        Cypress.env('MAILOSAUR_SERVER_ID'),
        {sentTo: testEmail1, subject: 'Markdown: You asked to reset your password.'},
        {receivedAfter: passwordResetTestStart}
      ).then(message => {
        let url: URL
        if (message.html.links[0].href?.includes('sendgrid.net')) {
          cy.retrieveDestinationURLFromSendGridRedirectURL(message.html.links[0].href).then(linkInHtml => {
            cy.retrieveDestinationURLFromSendGridRedirectURL(message.text.links[0].href).then(linkInText => {
              expect(linkInHtml).to.equal(linkInText)
              url = new URL(linkInHtml)

              const {origin, pathname, searchParams} = url
              expect(origin).to.equal(Cypress.config().baseUrl)
              expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir)
              const token = searchParams.get('token')
              const payload = decodeToken<any>(token)
              expect(payload.is).to.equal('ResetPasswordToken')
              expect(payload.email).to.equal(testEmail1)
              expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
            })
          })
        } else {
          expect(message.html.links[0].href).to.equal(message.text.links[0].href)
          url = new URL(message.html.links[0].href)

          const {origin, pathname, searchParams} = url
          expect(origin).to.equal(Cypress.config().baseUrl)
          expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir)
          const token = searchParams.get('token')
          const payload = decodeToken<any>(token)
          expect(payload.is).to.equal('ResetPasswordToken')
          expect(payload.email).to.equal(testEmail1)
          expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
        }
      })
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-login-button').click()

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(testEmail1)
      cy.getBySel('auth-modal-password-input').type(testPassword1)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail1)
    })

    it('shows success message and changes password when accessing sent url', () => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
      cy.task('generateResetPasswordToken', testEmail1).then(resetPasswordToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir}?token=${resetPasswordToken}`)
        cy.getBySel('auth-modal-password-input').type(testPassword2)
        cy.getBySel('auth-modal-password-confirm-input').type(testPassword2)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully set new password.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.getBySel('topbar-menu-button').click()
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // oldEmail / oldPassword
        cy.getBySel('auth-modal-email-input').type(testEmail1)
        cy.getBySel('auth-modal-password-input').type(testPassword1)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // oldEmail / newPassword
        cy.getBySel('auth-modal-password-input').clear()
        cy.getBySel('auth-modal-password-input').type(testPassword2)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(testEmail1)
      })
    })
  })

  context('delete account', () => {
    beforeEach(() => {
      cy.task('createUser', {email: testEmail1, password: testPassword1, isActivated: true})
      cy.setLoginTokenOnAsyncStorage(testEmail1, testPassword1)
    })
    afterEach(() => {
      cy.task('clearUser', testEmail1)
    })

    it('deletes user and its documents', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-delete-button').click()
      cy.task('getUser', testEmail1).should('have.length', 1)
      cy.task('getUserDocuments', testEmail1).should('have.length.gt', 0)
      cy.getBySel('auth-modal-submit-button').contains('Delete').click()
      cy.contains('Successfully delete account.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-login-button')
      cy.task('getUser', testEmail1).should('be.empty')
      cy.task('getUserDocuments', testEmail1).should('be.empty')
    })
  })
})
