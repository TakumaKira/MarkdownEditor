describe('documents sync', () => {
  context('when user signed in for the first time', () => {
    it('uploads saved documents to database', () => {
      cy.visit('/')
    })
  })

  context('edit from the first device', () => {
    it('uploads newly saved document to database', () => {

    })
  })

  context('edit from the second device', () => {
    it('gets saved documents from database when logged in', () => {

    })
  })

  context('the first device gets result of edit from the second device', () => {
    it('the first device gets updated documents in real time when the second device uploaded updates', () => {

    })
  })
})
