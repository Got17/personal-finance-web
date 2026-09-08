export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHENTICATED: "Unauthenticated.",
    UNAUTHENTICATED_OR_INVALID_TOKEN: "Unauthenticated or invalid token.",
    INVALID_CREDENTIALS: "Invalid credentials provided.",
    REGISTRATION_FAILED: "Registration failed.",
    CANNOT_CONNECT: "Unable to connect to authentication server.",
  },
  ACCOUNTS: {
    CANNOT_CONNECT: "Unable to connect to accounts server.",
    INVALID_RESPONSE: "Invalid response from accounts server.",
    VALIDATION_FAILED: "Validation failed on accounts server.",
    NOT_FOUND: "Account not found.",
    INVALID_DETAILS: "Invalid account details provided.",
    INVALID_UPDATE_DETAILS: "Invalid account update details provided.",
    CREATE_FAILED: "Failed to create account. Please try again.",
    UPDATE_FAILED: "Failed to update account. Please try again.",
    DEACTIVATE_FAILED: "Failed to deactivate account. Please try again.",
    AT_LEAST_ONE_FIELD_REQUIRED: "At least one field must be provided for update.",
  },
  PREFERENCES: {
    CANNOT_CONNECT: "Unable to connect to preferences server.",
    INVALID_RESPONSE: "Invalid response from preferences server.",
    INVALID_CURRENCY: "Base currency must be a valid 3-letter currency code (e.g. USD, EUR).",
  },
  GENERAL: {
    SOMETHING_WENT_WRONG: "An unexpected error occurred. Please try again.",
  },
} as const;
