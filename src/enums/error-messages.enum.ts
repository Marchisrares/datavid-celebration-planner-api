export enum MemberErrorMessages {
  NOT_FOUND = 'Member not found',
  MEMBER_NOT_FOUND_WITH_ID = 'Member with ID {id} not found',
  MUST_BE_ADULT = 'Member must be at least 18 years old',
  ALREADY_EXISTS = 'Member already exists with this combination of first name, last name, country, and city',
  INVALID_ID = 'Invalid member ID',
  CREATION_FAILED = 'Failed to create member',
  UPDATE_FAILED = 'Failed to update member',
  DELETE_FAILED = 'Failed to delete member'
}

export enum ValidationErrorMessages {
  VALIDATION_ERROR = 'Validation error',
  INVALID_INPUT = 'Invalid input data',
  REQUIRED_FIELD = '{field} is required',
  INVALID_EMAIL = 'Invalid email address',
  INVALID_DATE_FORMAT = 'Birth date must be in YYYY-MM-DD format',
  INVALID_TIMEZONE = 'Invalid timezone',
  FIELD_TOO_SHORT = '{field} is too short',
  FIELD_TOO_LONG = '{field} is too long'
}

export enum BirthdayErrorMessages {
  NO_BIRTHDAYS_FOUND = 'No birthdays found',
  INVALID_DAYS_PARAMETER = 'Invalid days parameter'
}

export enum AiErrorMessages {
  GENERATION_FAILED = 'Failed to generate AI message',
  INVALID_TONE = 'Invalid tone parameter',
  INVALID_LOCALE = 'Invalid locale parameter',
  PROVIDER_ERROR = 'AI provider error'
}

export enum EmailErrorMessages {
  SEND_FAILED = 'Failed to send email',
  INVALID_EMAIL_ADDRESS = 'Invalid email address',
  SMTP_CONNECTION_ERROR = 'SMTP connection error',
  EMAIL_NOT_CONFIGURED = 'Email service not configured'
}

export enum DatabaseErrorMessages {
  CONNECTION_ERROR = 'Database connection error',
  QUERY_FAILED = 'Database query failed',
  TRANSACTION_FAILED = 'Database transaction failed',
  UNIQUE_CONSTRAINT_VIOLATION = 'Unique constraint violation',
  FOREIGN_KEY_CONSTRAINT_VIOLATION = 'Foreign key constraint violation'
}

export enum GeneralErrorMessages {
  INTERNAL_SERVER_ERROR = 'Internal server error',
  UNAUTHORIZED = 'Unauthorized access',
  FORBIDDEN = 'Access forbidden',
  NOT_FOUND = 'Resource not found',
  BAD_REQUEST = 'Bad request',
  SERVICE_UNAVAILABLE = 'Service temporarily unavailable',
  RATE_LIMIT_EXCEEDED = 'Rate limit exceeded. Please try again later'
}
