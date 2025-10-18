import React, { useState } from 'react';
import { CRMSettings } from '../types';

interface CrmModalProps {
  onClose: () => void;
  currentSettings: CRMSettings;
  onSave: (settings: CRMSettings) => void;
}

const CrmModal: React.FC<CrmModalProps> = ({ onClose, currentSettings, onSave }) => {
  const [crmName, setCrmName] = useState(currentSettings.crmName);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [autoCreateTasks, setAutoCreateTasks] = useState(currentSettings.autoCreateTasks);
  const [attachSummary, setAttachSummary] = useState(currentSettings.attachSummary);
  const [apiKeyError, setApiKeyError] = useState('');

  const handleSave = () => {
    if (crmName !== 'None' && !apiKey.trim()) {
      setApiKeyError('שדה זה חובה עבור מערכת ה-CRM שנבחרה.');
      return;
    }
    setApiKeyError(''); // Clear error if validation passes

    onSave({ 
      crmName, 
      apiKey: crmName === 'None' ? '' : apiKey.trim(), 
      autoCreateTasks: crmName === 'None' ? false : autoCreateTasks, 
      attachSummary: crmName === 'None' ? false : attachSummary 
    });
  };

  const isConnected = currentSettings.crmName !== 'None' && currentSettings.apiKey;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-xl rounded-xl bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl leading-6 font-bold text-slate-800">אינטגרציות CRM</h3>
            <p className="text-sm text-slate-500 mt-1">סנכרן תובנות שיחה ישירות למערכת ניהול הלקוחות שלך.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-6 text-right p-2 max-h-[70vh] overflow-y-auto">
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="flex justify-between items-center">
                 <h4 className="font-semibold text-slate-700">סטטוס חיבור</h4>
                 <span className={`px-3 py-1 text-xs font-bold rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                    {isConnected ? `מחובר ל-${currentSettings.crmName}` : 'לא מחובר'}
                 </span>
             </div>
          </div>
          
          <div>
            <label htmlFor="crm-select" className="block text-sm font-medium text-slate-600 mb-2">בחר מערכת CRM</label>
            <select
              id="crm-select"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
              value={crmName}
              onChange={(e) => setCrmName(e.target.value as CRMSettings['crmName'])}
            >
              <option value="None">ללא חיבור</option>
              <option value="Salesforce">Salesforce</option>
              <option value="HubSpot">HubSpot</option>
            </select>
          </div>

          <div className={`space-y-6 transition-opacity duration-300 ${crmName === 'None' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-slate-600 mb-2">מפתח API</label>
                <input
                    type="password"
                    id="api-key"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm dir-ltr text-left"
                    placeholder="הדבק כאן את מפתח ה-API הסודי שלך"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (apiKeyError) setApiKeyError('');
                    }}
                    disabled={crmName === 'None'}
                />
                 {apiKeyError && <p className="text-red-500 text-xs mt-1">{apiKeyError}</p>}
                 <p className="text-xs text-slate-500 mt-1">מפתח ה-API נשמר באופן מאובטח בדפדפן שלך בלבד.</p>
             </div>
             
             <div className="space-y-4">
                 <h4 className="font-semibold text-slate-700">הגדרות סנכרון אוטומטי</h4>
                 <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input id="auto-tasks" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded" checked={autoCreateTasks} onChange={e => setAutoCreateTasks(e.target.checked)} disabled={crmName === 'None'}/>
                    </div>
                    <div className="mr-3 text-sm">
                        <label htmlFor="auto-tasks" className="font-medium text-slate-700">צור משימות אוטומטית</label>
                        <p className="text-slate-500">צור משימה חדשה ב-CRM עבור כל פריט פעולה שמוגדר "קריטי".</p>
                    </div>
                 </div>
                 <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input id="attach-summary" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded" checked={attachSummary} onChange={e => setAttachSummary(e.target.checked)} disabled={crmName === 'None'}/>
                    </div>
                    <div className="mr-3 text-sm">
                        <label htmlFor="attach-summary" className="font-medium text-slate-700">צרף סיכום שיחה</label>
                        <p className="text-slate-500">הוסף את סיכום השיחה לפעילות של איש הקשר המתאים ב-CRM.</p>
                    </div>
                 </div>
             </div>
          </div>
        </div>
        
        <div className="px-2 pt-4 border-t border-slate-200 mt-4 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-base font-semibold rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            שמור שינויים
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-800 text-base font-semibold rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-slate-300 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrmModal;