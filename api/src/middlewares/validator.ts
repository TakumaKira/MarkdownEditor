import { RequestHandler } from "express"
import Joi from 'joi'
import { DocumentsRequest } from "../models/document"

const regIsISODateString = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const documentsRequestSchema = Joi.object<DocumentsRequest>({
  updated: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    name: Joi.string().allow(null),
    content: Joi.string().allow(null),
    createdAt: Joi.string().regex(regIsISODateString).allow(null),
    updatedAt: Joi.string().regex(regIsISODateString).required(),
    isDeleted: Joi.boolean().required(),
  })),
  latestUpdatedDocumentFromDBAt: Joi.string().regex(regIsISODateString).allow(null)
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
