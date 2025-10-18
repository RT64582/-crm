export interface EmotionScore {
  Score: number;
  Explanation: string;
}

export interface ActionItem {
  Action: string;
  Urgency: 'קריטי' | 'גבוהה' | 'בינונית';
}

export interface AnalysisResult {
  id: string;
  AnalysisStatus: "Completed" | "Error";
  Summary?: string;
  EmotionScore?: EmotionScore;
  ActionItems?: ActionItem[];
  Message?: string;
  originalTranscript: string;
  timestamp: string;
  userId?: string; // Support for multi-tenancy
  isSyncedToCRM?: boolean; // Track CRM synchronization status
}

export interface NotificationSettings {
  isEnabled: boolean;
  recipients: string[];
}

export interface CRMSettings {
  crmName: 'None' | 'Salesforce' | 'HubSpot';
  apiKey: string;
  autoCreateTasks: boolean;
  attachSummary: boolean;
  autoSyncHourly: boolean; // Enable hourly background sync
  isVerified?: boolean; // Track if the API key has been successfully validated
  notes?: string; // Optional field for additional configuration details
}

export interface SlackSettings {
  isEnabled: boolean;
  webhookUrl: string;
  notifyOnCritical: boolean;
  isVerified: boolean;
}


export interface User {
  email: string;
  has2FA: boolean; // Does the user have Two-Factor Authentication enabled?
}
