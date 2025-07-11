/**
 * Firebase Error Utilities
 * Converts Firebase error codes to user-friendly messages
 */

interface FirebaseErrorMap {
  [key: string]: string;
}

const firebaseErrorMessages: FirebaseErrorMap = {
  // Authentication errors
  'auth/user-not-found': 'No account found with this email address. Please check your email or sign up for a new account.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support for assistance.',
  'auth/email-already-in-use': 'An account with this email already exists. Please use a different email or sign in instead.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
  'auth/invalid-credential': 'The credentials provided are invalid. Please check your email and password.',
  'auth/credential-already-in-use': 'This credential is already associated with a different user account.',
  'auth/invalid-verification-code': 'The verification code is invalid. Please try again.',
  'auth/invalid-verification-id': 'The verification ID is invalid. Please try again.',
  'auth/missing-verification-code': 'Please enter the verification code.',
  'auth/missing-verification-id': 'Verification ID is missing. Please try again.',
  'auth/code-expired': 'The verification code has expired. Please request a new one.',
  'auth/invalid-phone-number': 'Please enter a valid phone number.',
  'auth/missing-phone-number': 'Please enter your phone number.',
  'auth/quota-exceeded': 'Too many requests. Please try again later.',
  'auth/app-deleted': 'The app has been deleted. Please contact support.',
  'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
  'auth/argument-error': 'Invalid request. Please check your input and try again.',
  'auth/invalid-api-key': 'Invalid API key. Please contact support.',
  'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
  'auth/requires-recent-login': 'For security reasons, please sign in again to complete this action.',
  'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
  'auth/unauthorized-domain': 'This domain is not authorized for this operation.',
  'auth/user-token-expired': 'Your session has expired. Please sign in again.',
  
  // Custom API key errors
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Authentication service is temporarily unavailable. Please try again in a few moments.',
  
  // Firestore errors
  'firestore/permission-denied': 'You do not have permission to access this data.',
  'firestore/unavailable': 'Service is temporarily unavailable. Please try again later.',
  'firestore/not-found': 'The requested data was not found.',
  'firestore/already-exists': 'This data already exists.',
  'firestore/resource-exhausted': 'Service quota exceeded. Please try again later.',
  'firestore/failed-precondition': 'Operation failed due to system constraints.',
  'firestore/aborted': 'Operation was cancelled. Please try again.',
  'firestore/out-of-range': 'Invalid data range provided.',
  'firestore/unimplemented': 'This feature is not yet available.',
  'firestore/internal': 'Internal server error. Please try again later.',
  'firestore/deadline-exceeded': 'Request timed out. Please try again.',
  'firestore/cancelled': 'Operation was cancelled.',
  'firestore/invalid-argument': 'Invalid request parameters.',
  
  // Network and connectivity errors
  'network-request-failed': 'Network error. Please check your internet connection and try again.',
  'timeout': 'Request timed out. Please try again.',
  'unavailable': 'Service is temporarily unavailable. Please try again later.',
};

/**
 * Converts Firebase error to user-friendly message
 */
export const getFirebaseErrorMessage = (error: any): string => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return firebaseErrorMessages[error] || error;
  }

  // Handle Firebase error objects
  const errorCode = error.code || error.message || '';
  
  // Check for exact match first
  if (firebaseErrorMessages[errorCode]) {
    return firebaseErrorMessages[errorCode];
  }
  
  // Check for partial matches (for cases like the malformed API key error)
  for (const [key, message] of Object.entries(firebaseErrorMessages)) {
    if (errorCode.includes(key) || key.includes(errorCode)) {
      return message;
    }
  }
  
  // Handle common error patterns
  if (errorCode.includes('api-key') || errorCode.includes('API key')) {
    return 'Authentication service is temporarily unavailable. Please try again in a few moments.';
  }
  
  if (errorCode.includes('network') || errorCode.includes('connection')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (errorCode.includes('permission') || errorCode.includes('unauthorized')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (errorCode.includes('quota') || errorCode.includes('rate') || errorCode.includes('limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Extract readable message from Firebase error format
  let message = error.message || errorCode;
  
  // Clean up Firebase error format: "Firebase: Error (auth/code)."
  message = message.replace(/^Firebase:\s*Error\s*\(/i, '');
  message = message.replace(/\)\.?$/, '');
  message = message.replace(/^auth\//, '');
  message = message.replace(/^firestore\//, '');
  
  // Return cleaned message or fallback
  return message || 'An unexpected error occurred. Please try again.';
};

/**
 * Determines if an error should trigger a retry suggestion
 */
export const isRetryableError = (error: any): boolean => {
  const errorCode = error?.code || error?.message || '';
  
  const retryableErrors = [
    'network-request-failed',
    'timeout',
    'unavailable',
    'deadline-exceeded',
    'internal',
    'api-key',
    'quota-exceeded',
    'too-many-requests',
  ];
  
  return retryableErrors.some(retryable => 
    errorCode.includes(retryable) || retryable.includes(errorCode)
  );
};

/**
 * Determines if an error is related to user credentials
 */
export const isCredentialError = (error: any): boolean => {
  const errorCode = error?.code || error?.message || '';
  
  const credentialErrors = [
    'wrong-password',
    'user-not-found',
    'invalid-email',
    'invalid-credential',
    'user-disabled',
  ];
  
  return credentialErrors.some(credError => 
    errorCode.includes(credError)
  );
};