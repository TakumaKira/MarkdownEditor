describe('non registered user', () => {
  context('new non registered user without any params', () => {
    it('shows welcome document on load', () => {
      cy.visit('/')
    })
  })

  context('new non registered user with input params', () => {
    it('shows document passed as a parameter on load', () => {

    })
  })

  context('non registered user with local storage data and without any params', () => {
    it('shows former selected document on load', () => {

    })

    it('shows first document on load if selected document id was null', () => {

    })
  })

  context('non registered user with local storage data and with input params', () => {
    it('shows document passed as a parameter on load', () => {

    })
  })
})
