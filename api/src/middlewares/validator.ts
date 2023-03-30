import { RequestHandler } from "express"
import Joi from 'joi'
import { DOCUMENT_CONTENT_LENGTH_LIMIT, DOCUMENT_NAME_LENGTH_LIMIT } from "../constants"
import { DocumentsUpdateRequest } from "../models/document"

export const regIsISODateString = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const documentsRequestSchema = Joi.object<DocumentsUpdateRequest>({
  updates: Joi.array().required().items(Joi.object({
    id: Joi.string().required().guid({version: ['uuidv4']}),
    name: Joi.string().required().allow(null).max(DOCUMENT_NAME_LENGTH_LIMIT),
    content: Joi.string().required().allow(null).max(DOCUMENT_CONTENT_LENGTH_LIMIT).allow(''),
    createdAt: Joi.string().required().regex(regIsISODateString),
    updatedAt: Joi.string().required().regex(regIsISODateString),
    savedOnDBAt: Joi.string().required().allow(null).regex(regIsISODateString),
    isDeleted: Joi.boolean().required(),
  })),
})

const documentsRequestValidatorMiddleware: RequestHandler = (req, res, next) => {
  try {
    const result = documentsRequestSchema.validate(req.body)
    if (result.error) {
      return res.status(422).send({message: result.error.message})
    }
    req.documentsRequest = result.value
    next()
  } catch (e) {
    next(e)
  }
}
export { documentsRequestValidatorMiddleware }
