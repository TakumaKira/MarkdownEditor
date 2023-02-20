import { DocumentStateOnAsyncStorage } from "../../frontend/store/models/document"

describe('non registered user', () => {
  context('new non registered user without any params', () => {
    it('shows welcome document on load', () => {
      cy.visit('/')
      cy.contains('Welcome to Markdown')
    })
  })

  context('new non registered user with input params', () => {
    it('shows document passed as a parameter on load', () => {
      cy.visit('/?input=Test%20input%20from%20parameter.')
      cy.contains('Test input from parameter.')
    })
  })

  context('non registered user with local storage data and without any params', () => {
    it('shows former selected document on load', () => {
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [
          {
            id: "test-id-2",
            name: "Test document #2.md",
            content: "This is a test document #2.",
            createdAt: "2000-01-02T00:00:00.000Z",
            updatedAt: "2000-01-02T00:00:00.000Z",
            savedOnDBAt: null,
            isDeleted: false,
            isUploaded: false
          },
          {
            id: "test-id-1",
            name: "Test document #1.md",
            content: "This is a test document #1.",
            createdAt: "2000-01-01T00:00:00.000Z",
            updatedAt: "2000-01-01T00:00:00.000Z",
            savedOnDBAt: null,
            isDeleted: false,
            isUploaded: false
          },
        ],
        documentOnEdit: {
          id: "test-id-1"
        },
        lastSyncWithDBAt: null
      }
      window.localStorage.setItem('MARKDOWN_EDITOR_STATE_document', JSON.stringify(documentStateOnAsyncStorage))
      cy.visit('/')
      cy.contains('This is a test document #1.')
    })

    it('shows first document on load if selected document id was null', () => {
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [
          {
            id: "test-id-2",
            name: "Test document #2.md",
            content: "This is a test document #2.",
            createdAt: "2000-01-02T00:00:00.000Z",
            updatedAt: "2000-01-02T00:00:00.000Z",
            savedOnDBAt: null,
            isDeleted: false,
            isUploaded: false
          },
          {
            id: "test-id-1",
            name: "Test document #1.md",
            content: "This is a test document #1.",
            createdAt: "2000-01-01T00:00:00.000Z",
            updatedAt: "2000-01-01T00:00:00.000Z",
            savedOnDBAt: null,
            isDeleted: false,
            isUploaded: false
          },
        ],
        documentOnEdit: {
          id: null
        },
        lastSyncWithDBAt: null
      }
      window.localStorage.setItem('MARKDOWN_EDITOR_STATE_document', JSON.stringify(documentStateOnAsyncStorage))
      cy.visit('/')
      cy.contains('This is a test document #2.')
    })
  })

  context('non registered user with local storage data and with input params', () => {
    it('shows document passed as a parameter on load', () => {
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [
          {
            id: "test-id-1",
            name: "Test document #1.md",
            content: "This is a test document #1.",
            createdAt: "2000-01-01T00:00:00.000Z",
            updatedAt: "2000-01-01T00:00:00.000Z",
            savedOnDBAt: null,
            isDeleted: false,
            isUploaded: false
          },
        ],
        documentOnEdit: {
          id: "test-id-1"
        },
        lastSyncWithDBAt: null
      }
      window.localStorage.setItem('MARKDOWN_EDITOR_STATE_document', JSON.stringify(documentStateOnAsyncStorage))
      cy.visit('/?input=Test%20input%20from%20parameter.')
      cy.contains('Test input from parameter.')
    })
  })
})
