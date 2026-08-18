import type { NextFunction, Request, Response } from "express"
import type { ZodObject } from "zod"
import { BAD_REQUEST } from "../utils/http-status-code"

export class SchemaMiddleware {
  body(schema: ZodObject) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { success, error } = schema.safeParse(req.body)
      if (!success) {
        return res.status(BAD_REQUEST).json({
          success: false,
          error: error.issues.map((err) => ({
            field: err.path[0],
            message: err.message
          }))
        })
      }
      return next()
    }
  }

  query(schema: ZodObject) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { success, error } = schema.safeParse(req.query)
      if (!success) {
        return res.status(BAD_REQUEST).json({
          success: false,
          error: error.issues.map((err) => ({
            param: err.path[0],
            message: err.message
          }))
        })
      }
      return next()
    }
  }
}
