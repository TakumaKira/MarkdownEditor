import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { DOCUMENT_CONTENT_LENGTH_LIMIT, DOCUMENT_NAME_LENGTH_LIMIT } from '../../../src/constants'
import { documentsRequestValidatorMiddleware } from "../../../src/middlewares/validator"

describe('documentsRequestValidatorMiddleware', () => {
  // valid requests
  test('triggers next() with validated property if passed valid request 1', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'name',
          content: 'content',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalled()
    expect(req.documentsRequest).toEqual(req.body)
  })

  test('triggers next() with validated property if passed valid request 2', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: null,
          content: null,
          createdAt: null,
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: true,
        },
      ],
      latestUpdatedDocumentFromDBAt: null
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalled()
    expect(req.documentsRequest).toEqual(req.body)
  })

  test('triggers next() with validated property if passed valid request 3', () => {
    const body = {
      updated: [],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalled()
    expect(req.documentsRequest).toEqual(req.body)
  })

  // invalid requests
  test('triggers status() and send() with error message if passed invalid request 1', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'name',
          content: 'content',
          createdAt: '2000-01-01T00:00:00.000',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).toBeCalledWith(400)
    expect(send).toBeCalledWith({message: "\"updated[0].createdAt\" with value \"2000-01-01T00:00:00.000\" fails to match the required pattern: /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/"})
    expect(next).not.toBeCalled()
    expect(req.documentsRequest).toEqual(undefined)
  })

  test('triggers status() and send() with error message if passed invalid request 2', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'name',
          content: 'content',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).toBeCalledWith(400)
    expect(send).toBeCalledWith({message: "\"updated[0].updatedAt\" with value \"2000-01-01T00:00:00.000\" fails to match the required pattern: /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/"})
    expect(next).not.toBeCalled()
    expect(req.documentsRequest).toEqual(undefined)
  })

  test('triggers status() and send() with error message if passed invalid request 3', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'name',
          content: 'content',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).toBeCalledWith(400)
    expect(send).toBeCalledWith({message: "\"latestUpdatedDocumentFromDBAt\" with value \"2000-01-01T00:00:00.000\" fails to match the required pattern: /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/"})
    expect(next).not.toBeCalled()
    expect(req.documentsRequest).toEqual(undefined)
  })

  test('triggers status() and send() with error message if passed id is not valid uuid v4', () => {
    const body = {
      updated: [
        {
          id: `${uuidv4()}1`,
          name: 'name',
          content: 'content',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).toBeCalledWith(400)
    expect(send).toBeCalledWith({message: "\"updated[0].id\" must be a valid GUID"})
    expect(next).not.toBeCalled()
    expect(req.documentsRequest).toEqual(undefined)
  })

  // Length tests.
  test('triggers next() with validated property if passed name is not too long', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'a'.repeat(DOCUMENT_NAME_LENGTH_LIMIT),
          content: 'content',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalled()
    expect(req.documentsRequest).toEqual(req.body)
  })

  test('triggers status() and send() with error message if passed name is too long', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'a'.repeat(DOCUMENT_NAME_LENGTH_LIMIT + 1),
          content: 'content',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).toBeCalledWith(400)
    expect(send).toBeCalledWith({message: "\"updated[0].name\" length must be less than or equal to 50 characters long"})
    expect(next).not.toBeCalled()
    expect(req.documentsRequest).toEqual(undefined)
  })

  test('triggers next() with validated property if passed content is not too long', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'name',
          content: 'a'.repeat(DOCUMENT_CONTENT_LENGTH_LIMIT),
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).not.toBeCalled()
    expect(send).not.toBeCalled()
    expect(next).toBeCalled()
    expect(req.documentsRequest).toEqual(req.body)
  })

  test('triggers status() and send() with error message if passed content is too long', () => {
    const body = {
      updated: [
        {
          id: uuidv4(),
          name: 'name',
          content: 'a'.repeat(DOCUMENT_CONTENT_LENGTH_LIMIT + 1),
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          isDeleted: false,
        },
      ],
      latestUpdatedDocumentFromDBAt: '2000-01-01T00:00:00.000Z'
    }
    const req = {body} as Request
    const send = jest.fn()
    const status = jest.fn().mockReturnValue({send})
    const res = {status} as unknown as Response
    const next = jest.fn()
    documentsRequestValidatorMiddleware(req, res, next)
    expect(status).toBeCalledWith(400)
    expect(send).toBeCalledWith({message: "\"updated[0].content\" length must be less than or equal to 20000 characters long"})
    expect(next).not.toBeCalled()
    expect(req.documentsRequest).toEqual(undefined)
  })
})
