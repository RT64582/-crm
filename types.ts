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
}

export interface User {
  email: string;
}