import * as dayjs from 'dayjs'
import { API_PATHS } from '../../frontend/constants'
import { decodeToken, findUrl, getRandomStrings, getTestEmail } from "../support/utils"

describe('auth', () => {
  context('signup', () => {
    let testEmail: string = ''

    afterEach(() => {
      cy.task('deleteUser', testEmail)
    })

    it('sends confirmation email with url including token', () => {
      const testEmailTag = getRandomStrings(5)
      testEmail = getTestEmail(testEmailTag)
      const testPassword = getRandomStrings(8)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-signup-button').click()
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-password-confirm-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail}.`)
      const signupTestStart = Date.now()
      cy.getMessageSent(testEmailTag, signupTestStart)
        .then(inbox => {
          expect(inbox.result).to.equal('success')
          expect(inbox.count).to.equal(1)
          // TODO: Accept message contains multi urls.
          const linksInHtml = [...inbox.emails[0].html.matchAll(findUrl)].map(v => v[0])
          expect(linksInHtml.length).to.equal(2) // SendGrid seems to include another url with invisible image to check access to the email.
          const linksInText = [...inbox.emails[0].text.matchAll(findUrl)].map(v => v[0])
          expect(linksInText.length).to.equal(1)
          let url: URL
          if (linksInHtml[0].includes('sendgrid.net')) {
            cy.retrieveDestinationURLFromSendGridRedirectURL(linksInHtml[0]).then(linkInHtml => {
              cy.retrieveDestinationURLFromSendGridRedirectURL(linksInText[0]).then(linkInText => {
                expect(linkInHtml[0]).to.equal(linkInText[0])
                url = new URL(linkInHtml)

                const {origin, pathname, searchParams} = url
                expect(origin).to.equal(Cypress.config().baseUrl)
                expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir)
                const token = searchParams.get('token')
                const payload = decodeToken<any>(token)
                expect(payload.is).to.equal('SignupToken')
                expect(payload.email).to.equal(testEmail)
                expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
              })
            })
          } else {
            expect(linksInHtml[0]).to.equal(linksInText[0])
            url = new URL(linksInHtml[0])

            const {origin, pathname, searchParams} = url
            expect(origin).to.equal(Cypress.config().baseUrl)
            expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir)
            const token = searchParams.get('token')
            const payload = decodeToken<any>(token)
            expect(payload.is).to.equal('SignupToken')
            expect(payload.email).to.equal(testEmail)
            expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
          }
        })
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-login-button').click()

      // email / password
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('This user is not activated.')
    })

    it('shows success message and gets logged in when accessing sent url in html', () => {
      testEmail = `${getRandomStrings(8)}@email.com`
      const testPassword = getRandomStrings(8)
      cy.task('createUser', {email: testEmail, password: testPassword, isActivated: false})
      cy.task('generateSignupToken', testEmail).then(signupToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir}?token=${signupToken}`)
        cy.contains('Your email is confirmed successfully.')
        cy.getBySel('auth-modal-ok-button').click()
        cy.getBySel('topbar-menu-button').click()
        cy.contains(testEmail)
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // email / password
        cy.getBySel('auth-modal-email-input').type(testEmail)
        cy.getBySel('auth-modal-password-input').type(testPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(testEmail)

        cy.logout()
      })
    })
  })

  context('login and logout', () => {
    const testEmail = `${getRandomStrings(8)}@email.com`
    const testPassword = getRandomStrings(8)

    before(() => {
      cy.task('createUser', {email: testEmail, password: testPassword, isActivated: true})
    })
    after(() => {
      cy.task('deleteUser', testEmail)
    })

    it('can be logged in with registered email and password', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()

      // email / password
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-password-input').type(testPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail)

      cy.logout()
    })

    it('can be logged out', () => {
      cy.login(testEmail, testPassword)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button')
    })

    it('shows dialog when session is expired', () => {
      cy.login(testEmail, testPassword)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.contains(testEmail)
      cy.expireSessionCookie()
      cy.reload()
      cy.contains('Please login again.')
      cy.getBySel('message-modal-ok-button').click()
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button')
    })

    // Needs to test session expiration on server case for someone trying to extend session by modifying cookie on browser?

  })

  context('edit account', () => {
    let oldEmail: string = ''
    let newEmail: string = ''

    afterEach(() => {
      cy.task('deleteUser', oldEmail)
      cy.task('deleteUser', newEmail)
    })

    it('can change password and can be logged in only with the new password', () => {
      oldEmail = `${getRandomStrings(8)}@email.com`
      const oldPassword = getRandomStrings(8)
      const newPassword = getRandomStrings(8)
      cy.task('createUser', {email: oldEmail, password: oldPassword, isActivated: true})
      cy.login(oldEmail, oldPassword)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-password-input').type(newPassword)
      cy.getBySel('auth-modal-password-confirm-input').type(newPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Password successfully changed.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(oldEmail)
      cy.getBySel('auth-modal-password-input').type(oldPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // oldEmail / newPassword
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(newPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(oldEmail)

      cy.logout()
    })

    it('sends confirmation email with url including token if email is changed', () => {
      oldEmail = `${getRandomStrings(8)}@email.com`
      const newEmailTag = getRandomStrings(5)
      newEmail = getTestEmail(newEmailTag)
      const oldPassword = getRandomStrings(8)
      cy.task('createUser', {email: oldEmail, password: oldPassword, isActivated: true})
      cy.login(oldEmail, oldPassword)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-email-input').type(newEmail)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${newEmail}.`)
      const mailChangeTestStart = Date.now()
      cy.getMessageSent(newEmailTag, mailChangeTestStart)
        .then(inbox => {
          expect(inbox.result).to.equal('success')
          expect(inbox.count).to.equal(1)
          // TODO: Accept message contains multi urls.
          const linksInHtml = [...inbox.emails[0].html.matchAll(findUrl)].map(v => v[0])
          expect(linksInHtml.length).to.equal(2) // SendGrid seems to include another url with invisible image to check access to the email.
          const linksInText = [...inbox.emails[0].text.matchAll(findUrl)].map(v => v[0])
          expect(linksInText.length).to.equal(1)
          let url: URL
          if (linksInHtml[0].includes('sendgrid.net')) {
            cy.retrieveDestinationURLFromSendGridRedirectURL(linksInHtml[0]).then(linkInHtml => {
              cy.retrieveDestinationURLFromSendGridRedirectURL(linksInText[0]).then(linkInText => {
                expect(linkInHtml).to.equal(linkInText)
                url = new URL(linkInHtml)

                const {origin, pathname, searchParams} = url
                expect(origin).to.equal(Cypress.config().baseUrl)
                expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
                const token = searchParams.get('token')
                const payload = decodeToken<any>(token)
                expect(payload.is).to.equal('EmailChangeToken')
                expect(payload.oldEmail).to.equal(oldEmail)
                expect(payload.newEmail).to.equal(newEmail)
                expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
              })
            })
          } else {
            expect(linksInHtml[0]).to.equal(linksInText[0])
            url = new URL(linksInHtml[0])

            const {origin, pathname, searchParams} = url
            expect(origin).to.equal(Cypress.config().baseUrl)
            expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
            const token = searchParams.get('token')
            const payload = decodeToken<any>(token)
            expect(payload.is).to.equal('EmailChangeToken')
            expect(payload.oldEmail).to.equal(oldEmail)
            expect(payload.newEmail).to.equal(newEmail)
            expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
          }
        })
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()

      // newEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(newEmail)
      cy.getBySel('auth-modal-password-input').type(oldPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(oldEmail)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(oldEmail)

      cy.logout()
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      oldEmail = `${getRandomStrings(8)}@email.com`
      newEmail = `${getRandomStrings(8)}@email.com`
      const oldPassword = getRandomStrings(8)
      cy.task('createUser', {email: oldEmail, password: oldPassword, isActivated: true})
      cy.login(oldEmail, oldPassword)
      cy.task('generateEmailChangeToken', {oldEmail: oldEmail, newEmail: newEmail}).then(emailChangeToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir}?token=${emailChangeToken}`)
        cy.contains('Please enter your password to confirm new email.')
        cy.getBySel('auth-modal-password-input').type(oldPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully confirmed.')
        cy.getBySel('auth-modal-ok-button').click()
        cy.getBySel('topbar-menu-button').click()
        cy.contains(newEmail)
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // oldEmail / oldPassword
        cy.getBySel('auth-modal-email-input').type(oldEmail)
        cy.getBySel('auth-modal-password-input').type(oldPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // newEmail / oldPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(newEmail)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(newEmail)
      })

      cy.logout()
    })

    it('changes password immediately and sends confirmation email with url including token if asked both change at the same time', () => {
      oldEmail = `${getRandomStrings(8)}@email.com`
      newEmail = `${getRandomStrings(8)}@email.com`
      const oldPassword = getRandomStrings(8)
      const newPassword = getRandomStrings(8)
      cy.task('createUser', {email: oldEmail, password: oldPassword, isActivated: true})
      cy.login(oldEmail, oldPassword)
      cy.visit('/')
      const newEmailTag = getRandomStrings(5)
      newEmail = getTestEmail(newEmailTag)
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-edit-button').click()
      cy.getBySel('auth-modal-email-input').type(newEmail)
      cy.getBySel('auth-modal-password-input').type(newPassword)
      cy.getBySel('auth-modal-password-confirm-input').type(newPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${newEmail}.`)
      const mailWithPasswordChangeTestStart = Date.now()
      cy.getMessageSent(newEmailTag, mailWithPasswordChangeTestStart)
        .then(inbox => {
          expect(inbox.result).to.equal('success')
          expect(inbox.count).to.equal(1)
          // TODO: Accept message contains multi urls.
          const linksInHtml = [...inbox.emails[0].html.matchAll(findUrl)].map(v => v[0])
          expect(linksInHtml.length).to.equal(2) // SendGrid seems to include another url with invisible image to check access to the email.
          const linksInText = [...inbox.emails[0].text.matchAll(findUrl)].map(v => v[0])
          expect(linksInText.length).to.equal(1)
          let url: URL
          if (linksInHtml[0].includes('sendgrid.net')) {
            cy.retrieveDestinationURLFromSendGridRedirectURL(linksInHtml[0]).then(linkInHtml => {
              cy.retrieveDestinationURLFromSendGridRedirectURL(linksInText[0]).then(linkInText => {
                expect(linkInHtml).to.equal(linkInText)
                url = new URL(linkInHtml)

                const {origin, pathname, searchParams} = url
                expect(origin).to.equal(Cypress.config().baseUrl)
                expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
                const token = searchParams.get('token')
                const payload = decodeToken<any>(token)
                expect(payload.is).to.equal('EmailChangeToken')
                expect(payload.oldEmail).to.equal(oldEmail)
                expect(payload.newEmail).to.equal(newEmail)
                expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
              })
            })
          } else {
            expect(linksInHtml[0]).to.equal(linksInText[0])
            url = new URL(linksInHtml[0])

            const {origin, pathname, searchParams} = url
            expect(origin).to.equal(Cypress.config().baseUrl)
            expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir)
            const token = searchParams.get('token')
            const payload = decodeToken<any>(token)
            expect(payload.is).to.equal('EmailChangeToken')
            expect(payload.oldEmail).to.equal(oldEmail)
            expect(payload.newEmail).to.equal(newEmail)
            expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
          }
        })
      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(oldEmail)
      cy.getBySel('sidebar-logout-button').click()
      cy.getBySel('sidebar-login-button').click()

      // old email / new password is correct here.

      // oldEmail / oldPassword
      cy.getBySel('auth-modal-email-input').type(oldEmail) // old email
      cy.getBySel('auth-modal-password-input').type(oldPassword) // old password
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // newEmail / newPassword
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(newEmail) // new email
      cy.getBySel('auth-modal-password-input').clear()
      cy.getBySel('auth-modal-password-input').type(newPassword) // new password
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Email/Password is incorrect.')

      // old email / new password
      cy.getBySel('auth-modal-email-input').clear()
      cy.getBySel('auth-modal-email-input').type(oldEmail) // old email
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(oldEmail)

      cy.logout()
    })

    it('shows success message and gets logged in with new email when accessing sent url in html', () => {
      oldEmail = `${getRandomStrings(8)}@email.com`
      newEmail = `${getRandomStrings(8)}@email.com`
      const oldPassword = getRandomStrings(8)
      const newPassword = getRandomStrings(8)
      cy.task('createUser', {email: oldEmail, password: newPassword, isActivated: true})
      cy.login(oldEmail, newPassword)
      cy.task('generateEmailChangeToken', {oldEmail: oldEmail, newEmail: newEmail}).then(emailChangeToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir}?token=${emailChangeToken}`)
        cy.contains('Please enter your password to confirm new email.')
        cy.getBySel('auth-modal-password-input').type(oldPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Password is incorrect.')
        cy.getBySel('auth-modal-password-input').clear()
        cy.getBySel('auth-modal-password-input').type(newPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully confirmed.')
        cy.getBySel('auth-modal-ok-button').click()
        cy.getBySel('topbar-menu-button').click()
        cy.contains(newEmail)
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // oldEmail / oldPassword
        cy.getBySel('auth-modal-email-input').type(oldEmail)
        cy.getBySel('auth-modal-password-input').type(oldPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // newEmail / oldPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(newEmail)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // oldEmail / newPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(oldEmail)
        cy.getBySel('auth-modal-password-input').clear()
        cy.getBySel('auth-modal-password-input').type(newPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // newEmail / newPassword
        cy.getBySel('auth-modal-email-input').clear()
        cy.getBySel('auth-modal-email-input').type(newEmail)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(newEmail)
      })
      cy.logout()
    })
  })

  context('reset password', () => {
    let testEmail: string = ''

    afterEach(() => {
      cy.task('deleteUser', testEmail)
    })

    it('sends confirmation message with url including token if password reset is requested', () => {
      const testEmailTag = getRandomStrings(5)
      testEmail = getTestEmail(testEmailTag)
      const oldPassword = getRandomStrings(8)
      cy.task('createUser', {email: testEmail, password: oldPassword, isActivated: true})
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.contains('Forgot password?').click()
      cy.getBySel('auth-modal-email-input').type(testEmail)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains(`Confirmation email was sent to ${testEmail}.`)
      const passwordResetTestStart = Date.now()
      cy.getMessageSent(testEmailTag, passwordResetTestStart)
        .then(inbox => {
          expect(inbox.result).to.equal('success')
          expect(inbox.count).to.equal(1)
          // TODO: Accept message contains multi urls.
          const linksInHtml = [...inbox.emails[0].html.matchAll(findUrl)].map(v => v[0])
          expect(linksInHtml.length).to.equal(2) // SendGrid seems to include another url with invisible image to check access to the email.
          const linksInText = [...inbox.emails[0].text.matchAll(findUrl)].map(v => v[0])
          expect(linksInText.length).to.equal(1)
          let url: URL
          if (linksInHtml[0].includes('sendgrid.net')) {
            cy.retrieveDestinationURLFromSendGridRedirectURL(linksInHtml[0]).then(linkInHtml => {
              cy.retrieveDestinationURLFromSendGridRedirectURL(linksInText[0]).then(linkInText => {
                expect(linkInHtml).to.equal(linkInText)
                url = new URL(linkInHtml)

                const {origin, pathname, searchParams} = url
                expect(origin).to.equal(Cypress.config().baseUrl)
                expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir)
                const token = searchParams.get('token')
                const payload = decodeToken<any>(token)
                expect(payload.is).to.equal('ResetPasswordToken')
                expect(payload.email).to.equal(testEmail)
                expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
              })
            })
          } else {
            expect(linksInHtml[0]).to.equal(linksInText[0])
            url = new URL(linksInHtml[0])

            const {origin, pathname, searchParams} = url
            expect(origin).to.equal(Cypress.config().baseUrl)
            expect(pathname).to.equal(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir)
            const token = searchParams.get('token')
            const payload = decodeToken<any>(token)
            expect(payload.is).to.equal('ResetPasswordToken')
            expect(payload.email).to.equal(testEmail)
            expect(dayjs(new Date(payload.iat * 1000)).isAfter(dayjs().subtract(30, 'minutes')))
          }
        })
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-login-button').click()

      // email / oldPassword
      cy.getBySel('auth-modal-email-input').type(testEmail)
      // Still can be logged in with old password
      cy.getBySel('auth-modal-password-input').type(oldPassword)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')

      cy.getBySel('auth-modal-ok-button').click()
      cy.contains(testEmail)

      cy.logout()
    })

    it('shows success message and changes password when accessing sent url', () => {
      testEmail = `${getRandomStrings(8)}@email.com`
      const oldPassword = getRandomStrings(8)
      const newPassword = getRandomStrings(8)
      cy.task('createUser', {email: testEmail, password: oldPassword, isActivated: true})
      cy.task('generateResetPasswordToken', testEmail).then(resetPasswordToken => {
        cy.visit(`${API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir}?token=${resetPasswordToken}`)
        cy.getBySel('auth-modal-password-input').type(newPassword)
        cy.getBySel('auth-modal-password-confirm-input').type(newPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully set new password.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.getBySel('topbar-menu-button').click()
        cy.getBySel('sidebar-logout-button').click()
        cy.getBySel('sidebar-login-button').click()

        // oldEmail / oldPassword
        cy.getBySel('auth-modal-email-input').type(testEmail)
        cy.getBySel('auth-modal-password-input').type(oldPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Email/Password is incorrect.')

        // oldEmail / newPassword
        cy.getBySel('auth-modal-password-input').clear()
        cy.getBySel('auth-modal-password-input').type(newPassword)
        cy.getBySel('auth-modal-submit-button').click()
        cy.contains('Successfully logged in.')

        cy.getBySel('auth-modal-ok-button').click()
        cy.contains(testEmail)
      })

      cy.logout()
    })
  })

  context('delete account', () => {
    let testEmail: string = ''

    beforeEach(() => {
      testEmail = `${getRandomStrings(8)}@email.com`
      const testPassword = getRandomStrings(8)
      cy.task('createUser', {email: testEmail, password: testPassword, isActivated: true})
      cy.login(testEmail, testPassword)
    })
    afterEach(() => {
      cy.task('deleteUser', testEmail)
    })

    it('deletes user and its documents', () => {
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-delete-button').click()
      cy.task('getUser', testEmail).should('have.length', 1)
      cy.task('getUserDocuments', testEmail).should('have.length.gt', 0)
      cy.getBySel('auth-modal-submit-button').contains('Delete').click()
      cy.contains('Successfully delete account.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-login-button')
      cy.task('getUser', testEmail).should('be.empty')
      cy.task('getUserDocuments', testEmail).should('be.empty')
    })
  })
})
