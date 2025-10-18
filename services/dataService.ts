import { AnalysisResult, NotificationSettings, CRMSettings, SlackSettings } from '../types';

/**
 * This service simulates a backend data store using localStorage.
 * It's designed for multi-tenancy by keying all data with a userId.
 */

const getStorageKey = (userId: string, key: string) => `logiFlow_${userId}_${key}`;

// --- Analysis History ---

export const getAnalysisHistory = async (userId: string): Promise<AnalysisResult[]> => {
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
    const defaultSettings: CRMSettings = { crmName: 'None', apiKey: '', autoCreateTasks: false, attachSummary: false, autoSyncHourly: false, isVerified: false, notes: '' };
    return new Promise((resolve) => {
        try {
            const savedSettings = localStorage.getItem(getStorageKey(userId, 'crmSettings'));
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (typeof parsed === 'object' && parsed !== null && 'crmName' in parsed) {
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
     return new Promise((resolve) => {
        try {
            const { apiKey, ...settingsToStore } = settings;
            localStorage.setItem(getStorageKey(userId, 'crmSettings'), JSON.stringify(settingsToStore));
        } catch (error) {
            console.error("Could not save CRM settings to localStorage", error);
        }
        resolve();
    });
};

/**
 * Verifies a CRM API key. In a real app, this would be a backend call.
 * This version just checks if the key is a non-empty string.
 */
export const verifyCrmApiKey = async (settings: CRMSettings): Promise<{success: boolean; error?: string}> => {
    if (settings.apiKey && settings.apiKey.trim().length > 0) {
        return { success: true };
    }
    return { success: false, error: 'מפתח ה-API אינו יכול להיות ריק.' };
};


/**
 * Syncs analysis results to a connected CRM.
 */
export const syncResultsToCRM = async (resultsToSync: AnalysisResult[], settings: CRMSettings): Promise<string[]> => {
    console.log(`Syncing ${resultsToSync.length} items to ${settings.crmName}...`);
    resultsToSync.forEach(result => {
        if (settings.attachSummary && result.Summary) {
            console.log(`  > Attaching summary for result ${result.id}`);
        }
        if (settings.autoCreateTasks && result.ActionItems) {
            result.ActionItems
                .filter(item => item.Urgency === 'קריטי')
                .forEach(task => console.log(`  > Creating critical task for result ${result.id}: "${task.Action}"`));
        }
    });
    console.log('Sync complete.');
    return resultsToSync.map(r => r.id);
};

// --- Slack Settings ---

export const getSlackSettings = async (userId: string): Promise<SlackSettings> => {
    const defaultSettings: SlackSettings = { isEnabled: false, webhookUrl: '', notifyOnCritical: true, isVerified: false };
    return new Promise((resolve) => {
        try {
            const savedSettings = localStorage.getItem(getStorageKey(userId, 'slackSettings'));
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (typeof parsed === 'object' && parsed !== null && 'isEnabled' in parsed) {
                    resolve({ ...defaultSettings, ...parsed, webhookUrl: '' });
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
    return new Promise((resolve) => {
        try {
            const { webhookUrl, ...settingsToStore } = settings;
            localStorage.setItem(getStorageKey(userId, 'slackSettings'), JSON.stringify(settingsToStore));
        } catch (error) {
            console.error("Could not save Slack settings to localStorage", error);
        }
        resolve();
    });
};

export const verifySlackWebhook = async (webhookUrl: string): Promise<{success: boolean; error?: string}> => {
    // A more realistic client-side check for a Slack webhook URL format.
    if (webhookUrl.startsWith('https://hooks.slack.com/services/')) {
        return { success: true };
    }
    return { success: false, error: 'ה-Webhook URL אינו בפורמט תקין. אנא בדוק את הקישור.' };
};