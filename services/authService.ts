import { User } from '../types';

const USER_STORAGE_KEY = 'logiFlow_currentUser';

// Simulate a user database. In a real application, this would be a backend database.
const simulatedUserDB: { [email: string]: { password?: string; has2FA: boolean } } = {
  'admin@logiflow.ai': { password: 'password123', has2FA: false },
  'sara.cohen@gmail.com': { has2FA: false }, // Represents a user who signed up with Google
};


/**
 * Retrieves the current user from the session stored in localStorage.
 */
export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) as User : null;
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
    return null;
  }
};

/**
 * Stores the user object in localStorage to create a persistent session.
 */
export const finalizeLogin = (user: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user to localStorage', error);
  }
};

/**
 * Clears the user session from localStorage.
 */
export const logout = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error)
    {
    console.error('Failed to remove user from localStorage', error);
  }
};


/**
 * Simulates signing in a user with email and password against the simulated DB.
 */
export const signInWithEmail = async (email: string, password: string): Promise<{ user: User }> => {
  const lowerCaseEmail = email.toLowerCase();
  const existingUser = simulatedUserDB[lowerCaseEmail];

  if (!existingUser || existingUser.password !== password) {
    throw new Error('אימייל או סיסמה שגויים.');
  }

  const user: User = { email: lowerCaseEmail, has2FA: existingUser.has2FA };
  return { user };
};

/**
 * Simulates registering a new user with email and password in the simulated DB.
 */
export const registerWithEmail = async (email: string, password: string): Promise<{ user: User }> => {
  const lowerCaseEmail = email.toLowerCase();
  if (simulatedUserDB[lowerCaseEmail]) {
    throw new Error('משתמש עם כתובת אימייל זו כבר קיים.');
  }

  // Add the new user to our simulated DB
  simulatedUserDB[lowerCaseEmail] = { password, has2FA: false };

  const newUser: User = { email: lowerCaseEmail, has2FA: false };
  return { user: newUser };
};

/**
 * Simulates an interactive Google Sign-In flow, checking for existing users or creating new ones.
 */
export const signInWithGoogle = async (): Promise<{ user: User }> => {
  const email = window.prompt("כדי לדמות התחברות עם גוגל, אנא הזן כתובת אימייל:", "new.user@gmail.com");

  if (email === null) {
    // User cancelled the prompt
    throw new Error('הכניסה בוטלה על ידי המשתמש.');
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new Error('כתובת האימייל שהוזנה אינה תקינה.');
  }

  // Check if user exists. If so, log them in.
  const existingUser = simulatedUserDB[trimmedEmail];
  if (existingUser) {
    console.log(`Google Sign-In: Found existing user ${trimmedEmail}`);
    const user: User = { email: trimmedEmail, has2FA: existingUser.has2FA };
    return { user };
  }

  // If user doesn't exist, create a new one (without a password, as it's a Google account)
  console.log(`Google Sign-In: Creating new user ${trimmedEmail}`);
  simulatedUserDB[trimmedEmail] = { has2FA: false }; 
  const newUser: User = { email: trimmedEmail, has2FA: false };
  
  return { user: newUser };
};