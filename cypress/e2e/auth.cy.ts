describe('auth' , () => {
  context('singup', () => {
    it('sends confirmation email with url including token', () => {
      // TODO: Confirm confirmation email with Mailosaur.
      cy.visit('/')
    })

    it('shows success message and gets logged in when accessing sent url', () => {

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
