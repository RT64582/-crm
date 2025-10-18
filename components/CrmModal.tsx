import React, { useState, useEffect } from 'react';
import { CRMSettings, SlackSettings } from '../types';
import { verifyCrmApiKey, verifySlackWebhook } from '../services/dataService';

interface IntegrationsModalProps {
  onClose: () => void;
  currentCrmSettings: CRMSettings;
  currentSlackSettings: SlackSettings;
  onSave: (settings: { crm: CRMSettings, slack: SlackSettings }) => void;
}

const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>);
const WifiIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.555a5.5 5.5 0 017.778 0M12 20.25a.75.75 0 01.75-.75h.008a.75.75 0 01-.008 1.5h-.008a.75.75 0 01-.75-.75zM4.636 12.636a10.5 10.5 0 0114.728 0" /></svg>);
const SyncIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.992-4.993m-4.993 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" /></svg>);
const PuzzleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>);
const SlackIcon = () => (<svg className="h-8 w-8" viewBox="0 0 122.8 122.8"><path d="M25.8,77.6c0,5.6-4.6,10.2-10.2,10.2c-5.6,0-10.2-4.6-10.2-10.2c0-5.6,4.6-10.2,10.2-10.2h10.2V77.6z" fill="#36C5F0"></path><path d="M36,77.6c5.6,0,10.2-4.6,10.2-10.2c0-5.6-4.6-10.2-10.2-10.2c-5.6,0-10.2,4.6-10.2,10.2v10.2H36z" fill="#2EB67D"></path><path d="M45.2,25.8c-5.6,0-10.2,4.6-10.2,10.2c0,5.6,4.6,10.2,10.2,10.2c5.6,0,10.2-4.6,10.2-10.2V25.8H45.2z" fill="#ECB22E"></path><path d="M45.2,36c0-5.6,4.6-10.2,10.2-10.2c5.6,0,10.2,4.6,10.2,10.2c0,5.6-4.6,10.2-10.2,10.2H45.2V36z" fill="#E01E5A"></path><path d="M97,45.2c0-5.6,4.6-10.2,10.2-10.2c5.6,0,10.2,4.6,10.2,10.2c0,5.6-4.6,10.2-10.2,10.2H97V45.2z" fill="#E01E5A"></path><path d="M86.8,45.2c-5.6,0-10.2,4.6-10.2,10.2c0,5.6,4.6,10.2,10.2,10.2c5.6,0,10.2-4.6,10.2-10.2V45.2H86.8z" fill="#36C5F0"></path><path d="M77.6,97c5.6,0,10.2-4.6,10.2-10.2c0-5.6-4.6-10.2-10.2-10.2c-5.6,0-10.2,4.6-10.2,10.2v10.2H77.6z" fill="#ECB22E"></path><path d="M77.6,86.8c0,5.6-4.6,10.2-10.2,10.2c-5.6,0-10.2-4.6-10.2-10.2c0-5.6,4.6-10.2,10.2-10.2h10.2V86.8z" fill="#2EB67D"></path></svg>);


type Tab = 'connection' | 'sync' | 'tools';

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ onClose, currentCrmSettings, currentSlackSettings, onSave }) => {
  // CRM State
  const [crmName, setCrmName] = useState(currentCrmSettings.crmName);
  const [apiKey, setApiKey] = useState(currentCrmSettings.apiKey);
  const [autoCreateTasks, setAutoCreateTasks] = useState(currentCrmSettings.autoCreateTasks);
  const [attachSummary, setAttachSummary] = useState(currentCrmSettings.attachSummary);
  const [autoSyncHourly, setAutoSyncHourly] = useState(currentCrmSettings.autoSyncHourly);
  const [notes, setNotes] = useState(currentCrmSettings.notes || '');
  const [isCrmVerified, setIsCrmVerified] = useState(currentCrmSettings.isVerified || false);
  const [isCrmVerifying, setIsCrmVerifying] = useState(false);
  const [crmVerificationStatus, setCrmVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [crmVerificationMessage, setCrmVerificationMessage] = useState('');

  // Slack State
  const [isSlackEnabled, setIsSlackEnabled] = useState(currentSlackSettings.isEnabled);
  const [webhookUrl, setWebhookUrl] = useState(currentSlackSettings.webhookUrl);
  const [notifyOnCritical, setNotifyOnCritical] = useState(currentSlackSettings.notifyOnCritical);
  const [isSlackVerified, setIsSlackVerified] = useState(currentSlackSettings.isVerified);
  const [isSlackVerifying, setIsSlackVerifying] = useState(false);
  const [slackVerificationStatus, setSlackVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [slackVerificationMessage, setSlackVerificationMessage] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('connection');
  
  useEffect(() => {
    setIsCrmVerified(currentCrmSettings.isVerified || false);
    setCrmVerificationStatus('idle');
    setCrmVerificationMessage('');
  }, [crmName, currentCrmSettings.isVerified]);

  const handleTestCrmConnection = async () => {
    if (!apiKey.trim()) {
      setCrmVerificationStatus('error');
      setCrmVerificationMessage('מפתח ה-API לא יכול להיות ריק.');
      return;
    }
    setIsCrmVerifying(true);
    setCrmVerificationStatus('idle');
    setCrmVerificationMessage('');
    const crmSettings: CRMSettings = { ...currentCrmSettings, crmName, apiKey };
    const result = await verifyCrmApiKey(crmSettings);

    if (result.success) {
      setCrmVerificationStatus('success');
      setCrmVerificationMessage(`החיבור ל-${crmName} הצליח!`);
      setIsCrmVerified(true);
    } else {
      setCrmVerificationStatus('error');
      setCrmVerificationMessage(result.error || 'החיבור נכשל. בדוק את המפתח ונסה שוב.');
      setIsCrmVerified(false);
    }
    setIsCrmVerifying(false);
  };

  const handleTestSlackConnection = async () => {
    if (!webhookUrl.trim()) {
      setSlackVerificationStatus('error');
      setSlackVerificationMessage('Webhook URL לא יכול להיות ריק.');
      return;
    }
    setIsSlackVerifying(true);
    const result = await verifySlackWebhook(webhookUrl);
    if (result.success) {
        setSlackVerificationStatus('success');
        setSlackVerificationMessage('חיבור ה-Webhook לסלאק תקין!');
        setIsSlackVerified(true);
    } else {
        setSlackVerificationStatus('error');
        setSlackVerificationMessage(result.error || 'בדיקת החיבור נכשלה.');
        setIsSlackVerified(false);
    }
    setIsSlackVerifying(false);
  };


  const handleSave = () => {
    const isCrmConnected = crmName !== 'None';
    const finalCrmSettings: CRMSettings = { 
      crmName, 
      apiKey: '',
      autoCreateTasks: isCrmConnected ? autoCreateTasks : false, 
      attachSummary: isCrmConnected ? attachSummary : false,
      autoSyncHourly: isCrmConnected ? autoSyncHourly : false,
      isVerified: isCrmConnected ? isCrmVerified : false,
      notes: isCrmConnected ? notes.trim() : '',
    };
    
    const finalSlackSettings: SlackSettings = {
      isEnabled: isSlackEnabled,
      webhookUrl: '',
      notifyOnCritical: isSlackEnabled ? notifyOnCritical : true,
      isVerified: isSlackEnabled ? isSlackVerified : false,
    };

    onSave({ crm: finalCrmSettings, slack: finalSlackSettings });
  };
  
  const isCrmSettingsDisabled = crmName === 'None';

  const TabButton = ({ id, label, icon }: { id: Tab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
        activeTab === id
          ? 'bg-white/10 text-slate-100'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      {icon} {label}
    </button>
  );

  const ToggleSwitch = ({ id, checked, onChange, disabled, title, description }: { id: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean, title: string, description: string }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-brand-border">
        <div>
            <label htmlFor={id} className={`font-medium text-slate-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>{title}</label>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
        <label htmlFor={id} className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input 
                type="checkbox" 
                id={id}
                className="sr-only peer" 
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:bg-slate-800 peer-disabled:after:bg-slate-600"></div>
        </label>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-xl rounded-xl bg-brand-card border-brand-border" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <div>
            <h3 className="text-xl leading-6 font-bold text-slate-100">אינטגרציות וכלים</h3>
            <p className="text-sm text-slate-400 mt-1">חבר את LogiFlow AI לכלים החיוניים שלך.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mt-4 flex gap-2 border-b border-slate-700 mb-6">
            <TabButton id="connection" label="חיבור CRM" icon={<WifiIcon />}/>
            <TabButton id="sync" label="הגדרות סנכרון" icon={<SyncIcon />}/>
            <TabButton id="tools" label="כלים נוספים" icon={<PuzzleIcon />}/>
        </div>

        <div className="space-y-6 text-right p-2 max-h-[60vh] overflow-y-auto">
          {activeTab === 'connection' && (
            <div className="space-y-6 animate-fade-in-down">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-brand-border">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-200">סטטוס חיבור</h4>
                        <span className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full ${isCrmVerified ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                            {isCrmVerified ? <><CheckCircleIcon/> {`מחובר ל-${crmName}`}</> : 'לא מחובר'}
                        </span>
                    </div>
                </div>
                <div>
                  <label htmlFor="crm-select" className="block text-sm font-medium text-slate-400 mb-2">בחר מערכת CRM</label>
                  <select
                    id="crm-select"
                    className="w-full p-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-900/50 text-slate-200"
                    value={crmName}
                    onChange={(e) => setCrmName(e.target.value as CRMSettings['crmName'])}
                  >
                    <option value="None">ללא חיבור</option>
                    <option value="Salesforce">Salesforce</option>
                    <option value="HubSpot">HubSpot</option>
                  </select>
                </div>
                <div className={`space-y-6 transition-opacity duration-300 ${isCrmSettingsDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div>
                      <label htmlFor="api-key" className="block text-sm font-medium text-slate-400 mb-2">מפתח API</label>
                      <div className="flex items-stretch gap-2">
                          <input
                              type="password"
                              id="api-key"
                              className="w-full p-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm dir-ltr text-left bg-slate-900/50 text-slate-200"
                              placeholder={isCrmVerified ? "מחובר. הזן מפתח חדש כדי לשנות" : "הדבק כאן את מפתח ה-API הסודי שלך"}
                              value={apiKey}
                              onChange={(e) => {
                                  setApiKey(e.target.value);
                                  setCrmVerificationStatus('idle');
                                  setIsCrmVerified(false);
                              }}
                              disabled={isCrmSettingsDisabled}
                          />
                          <button onClick={handleTestCrmConnection} disabled={isCrmVerifying || !apiKey.trim()} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold text-sm rounded-lg hover:bg-slate-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-wait transition-colors flex-shrink-0">
                              {isCrmVerifying ? 'בודק...' : 'בדיקת חיבור'}
                          </button>
                      </div>
                      {crmVerificationMessage && (
                        <p className={`text-xs mt-2 ${crmVerificationStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {crmVerificationMessage}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="crm-notes" className="block text-sm font-medium text-slate-400 mb-2">הערות תצורה (אופציונלי)</label>
                      <textarea id="crm-notes" rows={3} className="w-full p-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-900/50 text-slate-200" placeholder="לדוגמה: 'סביבת Sandbox', 'מפתח של משתמש X'" value={notes} onChange={e => setNotes(e.target.value)} disabled={isCrmSettingsDisabled} />
                    </div>
                </div>
            </div>
          )}
          
          {activeTab === 'sync' && (
             <div className={`space-y-4 animate-fade-in-down ${!isCrmVerified ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {!isCrmVerified && (
                  <div className="text-center bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 text-yellow-300 text-sm">
                    יש לאמת חיבור ל-CRM בכרטיסיית "חיבור CRM" כדי להפעיל הגדרות אלו.
                  </div>
                )}
                <ToggleSwitch id="auto-tasks" checked={autoCreateTasks} onChange={e => setAutoCreateTasks(e.target.checked)} disabled={!isCrmVerified} title="צור משימות אוטומטית" description="צור משימה חדשה ב-CRM עבור כל פריט פעולה שמוגדר 'קריטי'."/>
                <ToggleSwitch id="attach-summary" checked={attachSummary} onChange={e => setAttachSummary(e.target.checked)} disabled={!isCrmVerified} title="צרף סיכום שיחה" description="הוסף את סיכום השיחה לפעילות של איש הקשר המתאים."/>
                <ToggleSwitch id="auto-sync" checked={autoSyncHourly} onChange={e => setAutoSyncHourly(e.target.checked)} disabled={!isCrmVerified} title="סנכרן אוטומטית כל שעה" description="הפעל סנכרון ברקע שישלח ניתוחים חדשים ל-CRM."/>
             </div>
          )}
          
          {activeTab === 'tools' && (
            <div className="animate-fade-in-down space-y-4">
               <ToggleSwitch id="slack-enabled" checked={isSlackEnabled} onChange={e => setIsSlackEnabled(e.target.checked)} disabled={false} title="הפעל אינטגרציית סלאק" description="קבל התראות על משימות קריטיות ישירות לערוץ סלאק."/>
               <div className={`space-y-4 transition-opacity duration-300 ${!isSlackEnabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div>
                    <label htmlFor="webhook-url" className="block text-sm font-medium text-slate-400 mb-2">Slack Webhook URL</label>
                    <div className="flex items-stretch gap-2">
                        <input
                            type="password"
                            id="webhook-url"
                            className="w-full p-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm dir-ltr text-left bg-slate-900/50 text-slate-200"
                            placeholder={isSlackVerified ? "מחובר. הזן URL חדש כדי לשנות" : "https://hooks.slack.com/services/..."}
                            value={webhookUrl}
                            onChange={(e) => {
                                setWebhookUrl(e.target.value);
                                setSlackVerificationStatus('idle');
                                setIsSlackVerified(false);
                            }}
                            disabled={!isSlackEnabled}
                        />
                        <button onClick={handleTestSlackConnection} disabled={isSlackVerifying || !webhookUrl.trim()} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold text-sm rounded-lg hover:bg-slate-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-wait transition-colors flex-shrink-0">
                            {isSlackVerifying ? 'בודק...' : 'בדיקה'}
                        </button>
                    </div>
                    {slackVerificationMessage && (
                      <p className={`text-xs mt-2 ${slackVerificationStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {slackVerificationMessage}
                      </p>
                    )}
                  </div>
                  <ToggleSwitch id="slack-critical" checked={notifyOnCritical} onChange={e => setNotifyOnCritical(e.target.checked)} disabled={!isSlackEnabled || !isSlackVerified} title="שלח התראות על משימות קריטיות" description="כאשר מסומן, תישלח הודעה לסלאק רק עבור משימות בדחיפות 'קריטית'."/>
               </div>
            </div>
          )}
        </div>
        
        <div className="px-2 pt-4 border-t border-slate-700 mt-4 flex gap-3">
           <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-card focus:ring-indigo-500 transition-all"
          >
            שמור שינויים
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/10 text-slate-300 text-base font-semibold rounded-lg shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-card focus:ring-indigo-500 border border-brand-border transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;
