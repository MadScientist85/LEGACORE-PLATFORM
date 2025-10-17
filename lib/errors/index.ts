/**
 * Custom Error Classes for LEGACORE Platform
 * 
 * These error classes provide consistent error handling across the platform
 * with proper status codes and structured error responses.
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, false)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message || `External service ${service} failed`, 503, false)
  }
}

/**
 * Error response structure for API responses
 */
export interface ErrorResponse {
  error: {
    message: string
    code?: string
    statusCode: number
    timestamp: string
    path?: string
    details?: any
  }
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
  error: Error | AppError,
  path?: string
): ErrorResponse {
  const isAppError = error instanceof AppError
  const statusCode = isAppError ? error.statusCode : 500
  const message = error.message || 'An unexpected error occurred'

  return {
    error: {
      message,
      code: error.name,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
}

/**
 * Error handler for Next.js API routes
 */
export function handleApiError(error: Error | AppError, path?: string): Response {
  const errorResponse = formatErrorResponse(error, path)
  
  // Log error for monitoring (in production, send to logging service)
  if (process.env.NODE_ENV === 'production') {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      path
    })
  } else {
    console.error('API Error:', error)
  }

  return Response.json(errorResponse, {
    status: errorResponse.error.statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Async handler wrapper for API routes to catch errors
 */
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleApiError(error as Error, new URL(req.url).pathname)
    }
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`
    )
  }
}

/**
 * Validate enum value
 */
export function validateEnum<T>(
  value: any,
  enumObj: Record<string, T>,
  fieldName: string = 'value'
): T {
  const validValues = Object.values(enumObj)
  
  if (!validValues.includes(value)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`
    )
  }
  
  return value as T
}

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(url: URL): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}
