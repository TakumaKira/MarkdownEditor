import { RequestHandler } from "express"
import Joi from 'joi'
import { DOCUMENT_CONTENT_LENGTH_LIMIT, DOCUMENT_NAME_LENGTH_LIMIT } from "../constants"
import { DocumentsUpdateRequest } from "../models/document"

const regIsISODateString = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const documentsRequestSchema = Joi.object<DocumentsUpdateRequest>({
  updates: Joi.array().items(Joi.object({
    id: Joi.string().required().guid({version: ['uuidv4']}),
    name: Joi.string().allow(null).max(DOCUMENT_NAME_LENGTH_LIMIT),
    content: Joi.string().allow(null).max(DOCUMENT_CONTENT_LENGTH_LIMIT),
    createdAt: Joi.string().allow(null).regex(regIsISODateString),
    updatedAt: Joi.string().required().regex(regIsISODateString),
    isDeleted: Joi.boolean().required(),
  })),
  requestUpdatesOnDBAfter: Joi.string().regex(regIsISODateString).allow(null)
})

const documentsRequestValidatorMiddleware: RequestHandler = (req, res, next) => {
  const result = documentsRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  req.documentsRequest = result.value
  next()
}
export { documentsRequestValidatorMiddleware }
