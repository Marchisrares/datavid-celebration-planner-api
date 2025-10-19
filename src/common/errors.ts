import { Request, Response, NextFunction } from 'express';
import { HttpStatus, ErrorCodes, GeneralErrorMessages } from '../enums';

export class HttpError extends Error {
  status: HttpStatus;
  code: ErrorCodes;
  details?: any;

  constructor(status: HttpStatus, message: string, code: ErrorCodes, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'HttpError';
  }
}

export class AppError extends HttpError {
  constructor(message: string, code: ErrorCodes, details?: any) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, code, details);
    this.name = 'AppError';
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, code: ErrorCodes, details?: any) {
    super(HttpStatus.BAD_REQUEST, message, code, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, code: ErrorCodes) {
    super(HttpStatus.NOT_FOUND, message, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, code: ErrorCodes) {
    super(HttpStatus.CONFLICT, message, code);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = GeneralErrorMessages.UNAUTHORIZED, code: ErrorCodes = ErrorCodes.UNAUTHORIZED) {
    super(HttpStatus.UNAUTHORIZED, message, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = GeneralErrorMessages.FORBIDDEN, code: ErrorCodes = ErrorCodes.FORBIDDEN) {
    super(HttpStatus.FORBIDDEN, message, code);
    this.name = 'ForbiddenError';
  }
}

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const code = err.code || ErrorCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || GeneralErrorMessages.INTERNAL_SERVER_ERROR;

  const payload: any = {
    success: false,
    error: {
      code,
      message,
      name: err.name || 'Error'
    }
  };

  if (err.details) {
    payload.error.details = err.details;
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
}
