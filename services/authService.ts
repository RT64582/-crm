// services/authService.ts

import { User } from '../types';

// In a real application, this user data would come from a secure database.
// Passwords would be securely hashed, never stored in plaintext.
const mockUsers: { [email: string]: { password?: string; user: User } } = {
  'admin@logiflow.ai': {
    password: 'password123',
    user: { email: 'admin@logiflow.ai', has2FA: true },
  },
  'user@example.com': {
    password: 'password123',
    user: { email: 'user@example.com', has2FA: false },
  },
  'google.user@gmail.com': {
    // No password, indicating a social login user
    user: { email: 'google.user@gmail.com', has2FA: false },
  }
};

const USER_SESSION_KEY = 'logiFlow_user_session';

// --- Core Authentication Flows ---

/**
 * Step 1 (Login): Authenticates primary credentials (email and password).
 * This simulates a call to a backend to verify the user.
 * @returns A status indicating success, 2FA requirement, or failure.
 */
export const authenticateCredentials = async (
  email: string,
  password: string
): Promise<{ status: 'SUCCESS' | '2FA_REQUIRED' | 'INVALID_CREDENTIALS'; user?: User; error?: string }> => {
  console.log(`// SIMULATING API CALL: Authenticating credentials for ${email}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const normalizedEmail = email.toLowerCase();
  const storedUser = mockUsers[normalizedEmail];

  if (storedUser && storedUser.password === password) {
    if (storedUser.user.has2FA) {
      return { status: '2FA_REQUIRED', user: storedUser.user };
    } else {
      return { status: 'SUCCESS', user: storedUser.user };
    }
  }

  return { status: 'INVALID_CREDENTIALS', error: 'כתובת האימייל או הסיסמה שהוזנו אינם נכונים.' };
};

/**
 * Step 2 (Login): Verifies the Two-Factor Authentication code.
 * @param email The user's email.
 * @param code The 6-digit code from an authenticator app.
 * @returns A status indicating success or failure.
 */
export const verify2FACode = async (
  email: string,
  code: string
): Promise<{ status: 'SUCCESS' | 'INVALID_CODE'; error?: string }> => {
  console.log(`// SIMULATING API CALL: Verifying 2FA code for ${email}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (/^\d{6}$/.test(code)) {
    return { status: 'SUCCESS' };
  }
  
  return { status: 'INVALID_CODE', error: 'הקוד שהוזן אינו תקין. נסה שוב.' };
};

/**
 * Handles user registration with email and password.
 */
export const registerWithEmail = async (
  email: string,
  password: string
): Promise<{ status: 'SUCCESS' | 'EMAIL_EXISTS'; user?: User; error?: string }> => {
  console.log(`// SIMULATING API CALL: Registering new user ${email}`);
  await new Promise(resolve => setTimeout(resolve, 1200));

  const normalizedEmail = email.toLowerCase();
  if (mockUsers[normalizedEmail]) {
    return { status: 'EMAIL_EXISTS', error: 'משתמש עם כתובת אימייל זו כבר קיים.' };
  }
  
  const newUser: User = { email: normalizedEmail, has2FA: false };
  mockUsers[normalizedEmail] = { password, user: newUser };
  
  console.log('// SIMULATION: User created:', mockUsers[normalizedEmail]);
  return { status: 'SUCCESS', user: newUser };
};

/**
 * Simulates the entire Google Sign-In flow.
 */
export const authenticateWithGoogle = async (): Promise<{ status: 'SUCCESS'; user: User }> => {
  console.log(`// SIMULATING API CALL: Google Sign-In flow starting...`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, you'd get user info from Google OAuth response.
  // Here, we'll use a mock Google user.
  const mockGoogleEmail = 'new.google.user@gmail.com'; 
  
  let user = mockUsers[mockGoogleEmail]?.user;
  
  // If the user doesn't exist, create them (auto-registration).
  if (!user) {
    console.log(`// SIMULATION: New Google user detected. Creating account for ${mockGoogleEmail}`);
    const newUser: User = { email: mockGoogleEmail, has2FA: false };
    mockUsers[mockGoogleEmail] = { user: newUser };
    user = newUser;
  }
  
  console.log(`// SIMULATION: Google Sign-In successful for ${user.email}`);
  return { status: 'SUCCESS', user };
};

/**
 * Simulates a password reset request.
 */
export const requestPasswordReset = async (email: string): Promise<{ status: 'SUCCESS' | 'NOT_FOUND'; message: string }> => {
    console.log(`// SIMULATING API CALL: Password reset requested for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const normalizedEmail = email.toLowerCase();
    if (mockUsers[normalizedEmail] && mockUsers[normalizedEmail].password) {
        return { status: 'SUCCESS', message: 'אם קיים חשבון המשויך לכתובת זו, ישלח אליו מייל לאיפוס סיסמה.' };
    }
    
    // We send a generic success message even if the user isn't found to prevent email enumeration attacks.
    return { status: 'NOT_FOUND', message: 'אם קיים חשבון המשויך לכתובת זו, ישלח אליו מייל לאיפוס סיסמה.' };
};


// --- Session Management ---

export const getCurrentUser = (): User | null => {
  try {
    const sessionData = localStorage.getItem(USER_SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error("Failed to parse user session data", error);
    return null;
  }
};

export const finalizeLogin = (user: User): void => {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user session data", error);
  }
};

export const logout = (): void => {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (error) {
    console.error("Failed to remove user session data", error);
  }
};
