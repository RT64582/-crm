import { AnalysisResult, NotificationSettings, CRMSettings } from '../types';

/**
 * This service simulates a backend data store.
 * In a real-world application, these functions would make API calls (e.g., using fetch)
 * to a secure backend server that interacts with a database (like Firestore, MongoDB, etc.).
 * For this demo, we use localStorage, but we key everything by user email to simulate
 * multi-tenancy and data isolation.
 */

const getStorageKey = (userId: string, key: string) => `logiFlow_${userId}_${key}`;

// --- Analysis History ---

export const getAnalysisHistory = async (userId: string): Promise<AnalysisResult[]> => {
  console.log(`// SIMULATING API CALL: Fetching history for ${userId}`);
  return new Promise((resolve) => {
    try {
      const savedResults = localStorage.getItem(getStorageKey(userId, 'results'));
      if (savedResults) {
        const parsed = JSON.parse(savedResults);
        if (Array.isArray(parsed)) {
          resolve(parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
          return;
        }
      }
      resolve([]);
    } catch (error) {
      console.error("Could not load results from localStorage", error);
      resolve([]);
    }
  });
};

export const saveAnalysisHistory = async (userId: string, results: AnalysisResult[]): Promise<void> => {
    console.log(`// SIMULATING API CALL: Saving history for ${userId}`);
    return new Promise((resolve) => {
        try {
            localStorage.setItem(getStorageKey(userId, 'results'), JSON.stringify(results));
        } catch (error) {
            console.error("Could not save results to localStorage", error);
        }
        resolve();
    });
};

// --- Notification Settings ---

export const getNotificationSettings = async (userId: string): Promise<NotificationSettings> => {
    console.log(`// SIMULATING API CALL: Fetching notification settings for ${userId}`);
    const defaultSettings = { isEnabled: false, recipients: [] };
    return new Promise((resolve) => {
        try {
            const savedSettings = localStorage.getItem(getStorageKey(userId, 'notificationSettings'));
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                 if (typeof parsed === 'object' && parsed !== null && 'isEnabled' in parsed) {
                    resolve(parsed);
                    return;
                }
            }
            resolve(defaultSettings);
        } catch (error) {
            console.error("Could not load notification settings from localStorage", error);
            resolve(defaultSettings);
        }
    });
};

export const saveNotificationSettings = async (userId: string, settings: NotificationSettings): Promise<void> => {
    console.log(`// SIMULATING API CALL: Saving notification settings for ${userId}`);
     return new Promise((resolve) => {
        try {
            localStorage.setItem(getStorageKey(userId, 'notificationSettings'), JSON.stringify(settings));
        } catch (error) {
            console.error("Could not save notification settings to localStorage", error);
        }
        resolve();
    });
};


// --- CRM Settings ---

export const getCrmSettings = async (userId: string): Promise<CRMSettings> => {
    console.log(`// SIMULATING API CALL: Fetching CRM settings for ${userId}`);
    const defaultSettings: CRMSettings = { crmName: 'None', apiKey: '', autoCreateTasks: false, attachSummary: false };
    return new Promise((resolve) => {
        try {
            const savedSettings = localStorage.getItem(getStorageKey(userId, 'crmSettings'));
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (typeof parsed === 'object' && parsed !== null && 'crmName' in parsed) {
                    resolve({ ...defaultSettings, ...parsed });
                    return;
                }
            }
            resolve(defaultSettings);
        } catch (error) {
            console.error("Could not load CRM settings from localStorage", error);
            resolve(defaultSettings);
        }
    });
};

export const saveCrmSettings = async (userId: string, settings: CRMSettings): Promise<void> => {
    console.log(`// SIMULATING API CALL: Saving CRM settings for ${userId}`);
     return new Promise((resolve) => {
        try {
            localStorage.setItem(getStorageKey(userId, 'crmSettings'), JSON.stringify(settings));
        } catch (error) {
            console.error("Could not save CRM settings to localStorage", error);
        }
        resolve();
    });
};
