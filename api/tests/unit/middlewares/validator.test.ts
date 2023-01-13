import { documentsRequestValidatorMiddleware } from "../../../src/middlewares/validator"
import { Request, Response } from 'express'

describe('documentsRequestValidatorMiddleware', () => {
  // valid requests
  test('triggers next() with validated property if passed valid request 1', () => {
    const body = {
      updated: [
        {
          id: 'id',
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
          id: 'id',
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
  test('triggers next() with validated property if passed invalid request 1', () => {
    const body = {
      updated: [
        {
          id: 'id',
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

  test('triggers next() with validated property if passed invalid request 2', () => {
    const body = {
      updated: [
        {
          id: 'id',
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

  test('triggers next() with validated property if passed invalid request 3', () => {
    const body = {
      updated: [
        {
          id: 'id',
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
})
