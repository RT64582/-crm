import { User } from '../types';

const USER_STORAGE_KEY = 'logiFlow_currentUser';

/**
 * Simulates logging in a user by saving their details to localStorage.
 * In a real app, this would involve an API call to a backend.
 * @param email The user's email to log in.
 * @returns The user object.
 */
export const login = (email: string): User => {
  const user: User = { email };
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Could not save user to localStorage", error);
  }
  return user;
};

/**
 * Logs out the current user by removing their details from localStorage.
 */
export const logout = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error("Could not remove user from localStorage", error);
  }
};

/**
 * Retrieves the currently logged-in user from localStorage.
 * @returns The user object if logged in, otherwise null.
 */
export const getCurrentUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && typeof parsedUser.email === 'string') {
        return parsedUser;
      }
    }
    return null;
  } catch (error) {
    console.error("Could not get user from localStorage", error);
    return null;
  }
};
