import { v4 as uuidv4 } from 'uuid'
import { DocumentOnDevice, DocumentStateOnAsyncStorage } from "../../frontend/store/models/document"
import { Document, DocumentsUpdateRequest } from '@api/document';

describe('documents sync', () => {
  const user1 = {email: 'user1@test.com', password: 'user1password', isActivated: true}
  const user2 = {email: 'user2@test.com', password: 'user2password', isActivated: true}
  before(() => {
    cy.task('createUser', user1)
    cy.task('createUser', user2)
  })
  afterEach(() => {
    cy.task('clearUserDocuments', user1.email)
    cy.task('clearUserDocuments', user2.email)
  })
  after(() => {
    cy.task('deleteUser', user1.email)
    cy.task('deleteUser', user2.email)
  })

  context('when user signed in for the first time', () => {
    it('uploads saved documents to database', () => {
      const document1: DocumentOnDevice = {
        id: uuidv4(),
        name: "Test document #1.md",
        content: "This is a test document #1.",
        createdAt: "2000-01-01T00:00:00.000Z",
        updatedAt: "2000-01-01T00:00:00.000Z",
        savedOnDBAt: null,
        isDeleted: false,
        isUploaded: false
      }
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [
          document1,
        ],
        documentOnEdit: {
          id: document1.id
        },
        lastSyncWithDBAt: null
      }
      cy.setDocumentStateOnAsyncStorage(documentStateOnAsyncStorage)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.getBySel('auth-modal-email-input').type(user1.email)
      cy.getBySel('auth-modal-password-input').type(user1.password)
      cy.task('getUserDocuments', user1.email).should('be.empty')
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
      cy.wait(100)
      cy.task('getUserDocuments', user1.email).should((documents: Document[]) => {
        expect(documents).to.have.length(1)
        expect(documents[0].id).to.equal(document1.id)
      })
    })
  })

  context('edit from the first device', () => {
    it('uploads newly saved document to database', () => {
      cy.login(user1.email, user1.password)
      const document1: DocumentOnDevice = {
        id: uuidv4(),
        name: "Test document #1.md",
        content: "This is a test document #1.",
        createdAt: "2000-01-01T00:00:00.000Z",
        updatedAt: "2000-01-01T00:00:00.000Z",
        savedOnDBAt: null,
        isDeleted: false,
        isUploaded: false
      }
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [
          document1,
        ],
        documentOnEdit: {
          id: document1.id
        },
        lastSyncWithDBAt: null
      }
      cy.setDocumentStateOnAsyncStorage(documentStateOnAsyncStorage)
      cy.visit('/')
      cy.wait(100)
      cy.task('getUserDocuments', user1.email).should((documents: Document[]) => {
        expect(documents).to.have.length(1)
        expect(documents[0].id).to.equal(document1.id)
      })
      cy.getBySel('topbar-menu-button').click()
      cy.contains('New Document').click()
      cy.wait(100)
      cy.task('getUserDocuments', user1.email).should((documents: Document[]) => {
        expect(documents).to.have.length(2)
        const documentsWithoutDocument1 = documents.filter(({id}) => id !== document1.id)
        expect(documentsWithoutDocument1).to.have.length(1)
        const newDocument = documentsWithoutDocument1[0]
        expect(newDocument.name).to.equal('Untitled Document.md')
        expect(newDocument.content).to.equal('')
      })
      cy.getBySel('topbar-title-input').clear()
      const newTitle = 'Test Document.md'
      const newContent = 'This is a test document.'
      cy.getBySel('topbar-title-input').type(newTitle)
      cy.getBySel('main-editor-input').type(newContent)
      cy.contains('Save Changes').click()
      cy.task('getUserDocuments', user1.email).should((documents: Document[]) => {
        expect(documents).to.have.length(2)
        const documentsWithoutDocument1 = documents.filter(({id}) => id !== document1.id)
        expect(documentsWithoutDocument1).to.have.length(1)
        const newDocument = documentsWithoutDocument1[0]
        expect(newDocument.name).to.equal(newTitle)
        expect(newDocument.content).to.equal(newContent)
      })
    })
  })

  context('edit from the second device', () => {
    it('gets saved documents from database when logged in', () => {
      const document1: Document = {
        id: uuidv4(),
        name: 'Test document.md',
        content: 'This is a test document.',
        createdAt: '2000-01-01T00:00:00.000Z',
        updatedAt: '2000-01-01T00:00:00.000Z',
        savedOnDBAt: '2000-01-01T00:00:01.000Z',
        isDeleted: false
      }
      const documents: Document[] = [
        document1,
      ]
      cy.task('updateDocumentsOnDB', {email: user1.email, documents})
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [],
        documentOnEdit: {
          id: null
        },
        lastSyncWithDBAt: null
      }
      cy.setDocumentStateOnAsyncStorage(documentStateOnAsyncStorage)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.getBySel('auth-modal-email-input').type(user1.email)
      cy.getBySel('auth-modal-password-input').type(user1.password)
      cy.getBySel('sidebar-documents-list').should('not.contain.text', document1.name)
      cy.getBySel('topbar-title-input').should('be.empty')
      cy.getBySel('main-editor-input').should('be.empty')
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.wait(100)
      cy.getBySel('topbar-title-input').should('have.value', document1.name)
      cy.getBySel('main-editor-input').should('have.value', document1.content)
      cy.getBySel('sidebar-documents-list').should('contain.text', document1.name)
    })
  })

  context('the first device gets result of edit from the second device', () => {
    it('the first device gets updated documents in real time when the second device uploaded updates', () => {
      cy.login(user1.email, user1.password)
      const documentFromOtherDevice: Document = {
        id: uuidv4(),
        name: 'Document from other device.md',
        content: 'This is a document from other device.',
        createdAt: '2000-01-01T00:00:00.000Z',
        updatedAt: '2000-01-01T00:00:00.000Z',
        savedOnDBAt: '2000-01-01T00:00:01.000Z',
        isDeleted: false
      }
      const documentsUpdateRequest: DocumentsUpdateRequest = {
        updates: [
          documentFromOtherDevice,
        ]
      }
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [],
        documentOnEdit: {
          id: null
        },
        lastSyncWithDBAt: null
      }
      cy.setDocumentStateOnAsyncStorage(documentStateOnAsyncStorage)
      cy.visit('/')
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-documents-list').should('not.contain.text', documentFromOtherDevice.name)
      cy.getBySel('topbar-title-input').should('be.empty')
      cy.getBySel('main-editor-input').should('be.empty')
      cy.updateDocuments(user1.email, user1.password, documentsUpdateRequest)
      cy.getBySel('sidebar-documents-list').should('contain.text', documentFromOtherDevice.name)
      cy.getBySel('topbar-title-input').should('have.value', documentFromOtherDevice.name)
      cy.getBySel('main-editor-input').should('have.value', documentFromOtherDevice.content)
    })
  })

  context('switch account', () => {
    it("only new documents are saved as another account's documents if switched accounts", () => {
      const documentStateOnAsyncStorage: DocumentStateOnAsyncStorage = {
        documentList: [],
        documentOnEdit: {
          id: null
        },
        lastSyncWithDBAt: null
      }
      cy.setDocumentStateOnAsyncStorage(documentStateOnAsyncStorage)
      cy.visit('/')
      const user1sDocument = {
        name: "User1's Document",
        content: "This is user1's document."
      }
      const user2sDocument = {
        name: "User2's Document",
        content: "This is user2's document."
      }
      cy.getBySel('topbar-title-input').type(user1sDocument.name)
      cy.getBySel('main-editor-input').type(user1sDocument.content)
      cy.contains('Save Changes').click()
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-login-button').click()
      cy.getBySel('auth-modal-email-input').type(user1.email)
      cy.getBySel('auth-modal-password-input').type(user1.password)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-logout-button').click()
      cy.contains('New Document').click()
      cy.getBySel('topbar-title-input').clear()
      cy.getBySel('topbar-title-input').type(user2sDocument.name)
      cy.getBySel('main-editor-input').type(user2sDocument.content)
      cy.contains('Save Changes').click()
      cy.getBySel('topbar-menu-button').click()
      cy.getBySel('sidebar-documents-list').should('contain.text', user1sDocument.name)
      cy.getBySel('sidebar-documents-list').should('contain.text', user2sDocument.name)
      cy.getBySel('sidebar-login-button').click()
      cy.getBySel('auth-modal-email-input').type(user2.email)
      cy.getBySel('auth-modal-password-input').type(user2.password)
      cy.getBySel('auth-modal-submit-button').click()
      cy.contains('Successfully logged in.')
      cy.getBySel('auth-modal-ok-button').click()
      cy.getBySel('sidebar-documents-list').should('not.contain.text', user1sDocument.name)
      cy.getBySel('sidebar-documents-list').should('contain.text', user2sDocument.name)
    })
  })
})
