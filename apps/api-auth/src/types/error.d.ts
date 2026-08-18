export type ErrorField = { field: string; message: string }
export type ErrorParam = { param: string; message: string }
export type HttpError = { status: number; error: string | ErrorField[] | ErrorParam[] }
