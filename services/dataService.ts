import { AnalysisResult, NotificationSettings, CRMSettings, SlackSettings } from '../types';

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
    const defaultSettings: CRMSettings = { crmName: 'None', apiKey: '', autoCreateTasks: false, attachSummary: false, autoSyncHourly: false, isVerified: false, notes: '' };
    return new Promise((resolve) => {
        try {
            const savedSettings = localStorage.getItem(getStorageKey(userId, 'crmSettings'));
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (typeof parsed === 'object' && parsed !== null && 'crmName' in parsed) {
                    // Ensure apiKey is never returned from storage, promoting a secure pattern
                    resolve({ ...defaultSettings, ...parsed, apiKey: '' });
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
            // SECURITY: Create a copy of the settings but exclude the API key before saving to client-side storage.
            // In a real app, the backend would encrypt and store the key, only returning the verification status.
            const { apiKey, ...settingsToStore } = settings;
            localStorage.setItem(getStorageKey(userId, 'crmSettings'), JSON.stringify(settingsToStore));
        } catch (error) {
            console.error("Could not save CRM settings to localStorage", error);
        }
        resolve();
    });
};

/**
 * Simulates verifying a CRM API key against a backend.
 * @param settings The CRM settings containing the key to verify.
 * @returns A promise resolving to a success or error object.
 */
export const verifyCrmApiKey = async (settings: CRMSettings): Promise<{success: boolean; error?: string}> => {
    console.log(`// SIMULATING API CALL: Verifying API key for ${settings.crmName}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

    // This is mock logic. A real backend would make an actual API call to the CRM.
    if (settings.apiKey.startsWith('VALID-KEY')) {
        return { success: true };
    }
    if (settings.apiKey.startsWith('INVALID-KEY')) {
        return { success: false, error: 'המפתח שהוזן אינו תקין או שאין לו הרשאות מתאימות.' };
    }
    return { success: false, error: 'שגיאת רשת. לא ניתן היה להתחבר לשרתי ה-CRM.' };
};


/**
 * Simulates syncing analysis results to a connected CRM.
 * @param resultsToSync The analysis results to be synced.
 * @param settings The current CRM settings.
 * @returns A promise that resolves with an array of IDs of the successfully synced items.
 */
export const syncResultsToCRM = async (resultsToSync: AnalysisResult[], settings: CRMSettings): Promise<string[]> => {
    console.log(`// SIMULATING HOURLY CRM SYNC to ${settings.crmName} for ${resultsToSync.length} items...`);
    // Simulate some network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    resultsToSync.forEach(result => {
        console.log(`- Syncing result ${result.id}`);
        if (settings.attachSummary && result.Summary) {
            console.log(`  > Attaching summary to contact: "${result.Summary.substring(0, 40)}..."`);
        }
        if (settings.autoCreateTasks && result.ActionItems) {
            const criticalTasks = result.ActionItems.filter(item => item.Urgency === 'קריטי');
            if (criticalTasks.length > 0) {
                criticalTasks.forEach(task => {
                    console.log(`  > Creating critical task in CRM: "${task.Action}"`);
                });
            }
        }
    });

    console.log('// SIMULATION: Sync complete.');
    // In a real app, you might get confirmation from the API. Here we assume all succeed.
    return resultsToSync.map(r => r.id);
};

// --- Slack Settings ---

export const getSlackSettings = async (userId: string): Promise<SlackSettings> => {
    console.log(`// SIMULATING API CALL: Fetching Slack settings for ${userId}`);
    const defaultSettings: SlackSettings = { isEnabled: false, webhookUrl: '', notifyOnCritical: true, isVerified: false };
    return new Promise((resolve) => {
        try {
            const savedSettings = localStorage.getItem(getStorageKey(userId, 'slackSettings'));
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (typeof parsed === 'object' && parsed !== null && 'isEnabled' in parsed) {
                    resolve({ ...defaultSettings, ...parsed, webhookUrl: '' }); // Never return stored URL
                    return;
                }
            }
            resolve(defaultSettings);
        } catch (error) {
            console.error("Could not load Slack settings from localStorage", error);
            resolve(defaultSettings);
        }
    });
};

export const saveSlackSettings = async (userId: string, settings: SlackSettings): Promise<void> => {
    console.log(`// SIMULATING API CALL: Saving Slack settings for ${userId}`);
    return new Promise((resolve) => {
        try {
            const { webhookUrl, ...settingsToStore } = settings; // Never store the webhook URL
            localStorage.setItem(getStorageKey(userId, 'slackSettings'), JSON.stringify(settingsToStore));
        } catch (error) {
            console.error("Could not save Slack settings to localStorage", error);
        }
        resolve();
    });
};

export const verifySlackWebhook = async (webhookUrl: string): Promise<{success: boolean; error?: string}> => {
    console.log(`// SIMULATING API CALL: Verifying Slack Webhook URL`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (webhookUrl.startsWith('https://hooks.slack.com/services/VALID')) {
        return { success: true };
    }
    return { success: false, error: 'ה-Webhook URL אינו תקין. אנא בדוק את הקישור שהעתקת מסלאק.' };
};