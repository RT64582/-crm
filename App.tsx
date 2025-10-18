import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CallAnalysisForm from './components/CallAnalysisForm';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import GuideModal from './components/GuideModal';
import SettingsModal from './components/SettingsModal';
import IntegrationsModal from './components/CrmModal';
import NotificationToast from './components/NotificationToast';
import Login from './components/Login';
import * as authService from './services/authService';
import * as dataService from './services/dataService';
import { AnalysisResult, NotificationSettings, CRMSettings, User, SlackSettings } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ isEnabled: false, recipients: [] });
  const [crmSettings, setCrmSettings] = useState<CRMSettings>({ crmName: 'None', apiKey: '', autoCreateTasks: false, attachSummary: false, autoSyncHourly: false, isVerified: false });
  const [slackSettings, setSlackSettings] = useState<SlackSettings>({ isEnabled: false, webhookUrl: '', notifyOnCritical: true, isVerified: false });

  const [latestError, setLatestError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isAnalysisSidebarOpen, setIsAnalysisSidebarOpen] = useState(true);

  useEffect(() => {
    // Check for an existing session on initial load
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadUserData(user);
    }
    setIsLoading(false);
  }, []);

  const loadUserData = async (user: User) => {
      const [loadedResults, loadedNotifications, loadedCrm, loadedSlack] = await Promise.all([
          dataService.getAnalysisHistory(user.email),
          dataService.getNotificationSettings(user.email),
          dataService.getCrmSettings(user.email),
          dataService.getSlackSettings(user.email)
      ]);

      const userEmail = user.email;
      let updatedNotifications = loadedNotifications;

      // Automatically add user's email to recipients if not already present
      const emailExists = loadedNotifications.recipients.some(
          recipient => recipient.toLowerCase() === userEmail.toLowerCase()
      );

      if (!emailExists) {
          const newRecipients = [...loadedNotifications.recipients, userEmail];
          updatedNotifications = { ...loadedNotifications, recipients: newRecipients };
          
          await dataService.saveNotificationSettings(userEmail, updatedNotifications);
          triggerToast(`האימייל שלך (${userEmail}) הוסף אוטומטית לקבלת התראות.`);
      }
      
      setResults(loadedResults);
      setNotificationSettings(updatedNotifications);
      setCrmSettings(loadedCrm);
      setSlackSettings(loadedSlack);
  };
  
  useEffect(() => {
    // Cleanup timeouts on component unmount
    return () => {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    }
  }, []);

    // Effect for handling hourly CRM sync
  useEffect(() => {
    if (!crmSettings.autoSyncHourly || !crmSettings.isVerified || !currentUser) {
      return; // Do nothing if sync is disabled, not verified, or user is not logged in
    }

    const syncInterval = setInterval(async () => {
      console.log('Hourly CRM sync triggered...');
      
      // We use a function with setResults to get the latest state inside the interval
      setResults(currentResults => {
          const resultsToSync = currentResults.filter(
            r => r.AnalysisStatus === 'Completed' && !r.isSyncedToCRM
          );

          if (resultsToSync.length > 0) {
            (async () => {
              const syncedIds = await dataService.syncResultsToCRM(resultsToSync, crmSettings);
              if (syncedIds.length > 0) {
                 const updatedResults = currentResults.map(r => 
                    syncedIds.includes(r.id) ? { ...r, isSyncedToCRM: true } : r
                 );
                 // Persist the changes
                 await dataService.saveAnalysisHistory(currentUser.email, updatedResults);
                 
                 // This state update will be batched with the one from the outer scope if needed
                 setResults(updatedResults);

                 // Show feedback to the user
                 triggerToast(`${syncedIds.length} ניתוחים חדשים סונכרנו אוטומטית ל-${crmSettings.crmName}.`);
              }
            })();
          } else {
            console.log('No new results to sync.');
          }
          // Return the original state, the async part will update it later
          return currentResults;
      });
      
    }, 1 * 60 * 60 * 1000); // 1 hour

    return () => clearInterval(syncInterval);
  }, [crmSettings, currentUser]); // Rerun effect if settings or user change


  const triggerToast = (message: string) => {
    if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
        setToastMessage(null);
    }, 6000);
  };

  const addAnalysisResult = async (result: AnalysisResult) => {
    if (!currentUser) return;
    const newResults = [result, ...results];
    setResults(newResults);
    await dataService.saveAnalysisHistory(currentUser.email, newResults);

    if (result.AnalysisStatus === 'Error') {
      const errorMessage = result.Message || 'הניתוח נכשל מסיבה לא ידועה.';
      setLatestError(errorMessage);
      
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      
      errorTimeoutRef.current = window.setTimeout(() => {
         setLatestError(currentError => currentError === errorMessage ? null : currentError);
      }, 7000);

    } else if (result.AnalysisStatus === 'Completed' && notificationSettings.isEnabled) {
      const hasCriticalItem = result.ActionItems?.some(item => item.Urgency === 'קריטי');
      if (hasCriticalItem && notificationSettings.recipients.length > 0) {
        triggerToast(`התראה על משימה קריטית נשלחה אל: ${notificationSettings.recipients.join(', ')}`);
      } else if (hasCriticalItem) {
        triggerToast('זוהתה משימה קריטית חדשה. יש להגדיר נמענים לקבלת התראות.');
      }
    }
  };
  
  const clearHistory = async () => {
    if (!currentUser) return;
    setResults([]);
    await dataService.saveAnalysisHistory(currentUser.email, []);
    triggerToast('היסטוריית הניתוחים נוקתה.');
  };

  const deleteAnalysisResult = async (id: string) => {
    if (!currentUser) return;
    const newResults = results.filter(r => r.id !== id);
    setResults(newResults);
    await dataService.saveAnalysisHistory(currentUser.email, newResults);
    triggerToast('ניתוח השיחה נמחק בהצלחה.');
  };


  const dismissError = () => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setLatestError(null);
  };
  
  const handleSaveSettings = async (settings: NotificationSettings) => {
    if (!currentUser) return;
    setNotificationSettings(settings);
    await dataService.saveNotificationSettings(currentUser.email, settings);
    setIsSettingsModalOpen(false);
  };
  
  const handleSaveIntegrations = async (settings: { crm: CRMSettings, slack: SlackSettings }) => {
    if (!currentUser) return;
    setCrmSettings(settings.crm);
    setSlackSettings(settings.slack);
    await Promise.all([
      dataService.saveCrmSettings(currentUser.email, settings.crm),
      dataService.saveSlackSettings(currentUser.email, settings.slack)
    ]);
    setIsIntegrationsModalOpen(false);
    triggerToast(`הגדרות האינטגרציות נשמרו.`);
  };

  const handleLogin = (user: User) => {
    authService.finalizeLogin(user); // Finalize session
    setCurrentUser(user);
    loadUserData(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setResults([]); // Clear data on logout
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-dark">
          <div className="w-16 h-16 border-4 border-indigo-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-brand-dark min-h-screen font-sans flex flex-col">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
        onToggleAnalysisSidebar={() => setIsAnalysisSidebarOpen(prev => !prev)}
      />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full">
        {latestError && (
          <div className="bg-red-500/10 border-r-4 border-red-500 text-red-300 p-4 mb-6 rounded-lg shadow-md relative animate-fade-in-down" role="alert">
            <div className="flex items-start">
              <div className="py-1 flex-shrink-0">
                  <svg className="fill-current h-6 w-6 text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.829a1 1 0 0 0-1.414-1.414L10 8.586 7.172 5.757a1 1 0 0 0-1.414 1.414L8.586 10l-2.829 2.829a1 1 0 1 0 1.414 1.414L10 11.414l2.829 2.829a1 1 0 0 0 1.414-1.414L11.414 10z"/></svg>
              </div>
              <div>
                <p className="font-bold text-red-200">שגיאה בניתוח האחרון</p>
                <p className="text-sm">{latestError}</p>
              </div>
            </div>
            <button onClick={dismissError} className="absolute top-0 bottom-0 left-0 px-4 py-3" aria-label="סגור הודעה">
               <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>סגור</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full flex-grow">
                <Dashboard 
                    results={results} 
                    onClearHistory={clearHistory}
                    onDeleteResult={deleteAnalysisResult} 
                />
            </div>
            <div className={`flex-shrink-0 transition-all duration-500 ease-in-out lg:sticky lg:top-24 ${isAnalysisSidebarOpen ? 'w-full lg:max-w-md opacity-100' : 'w-0 opacity-0'}`} style={{ overflow: isAnalysisSidebarOpen ? 'visible' : 'hidden' }}>
                <div className="w-full lg:max-w-md">
                    <CallAnalysisForm onAnalysisComplete={addAnalysisResult} />
                </div>
            </div>
        </div>
      </main>
      <Footer />

      {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
      {isGuideModalOpen && <GuideModal onClose={() => setIsGuideModalOpen(false)} />}
      {isSettingsModalOpen && 
        <SettingsModal 
            onClose={() => setIsSettingsModalOpen(false)} 
            currentSettings={notificationSettings}
            onSave={handleSaveSettings}
        />}
       {isIntegrationsModalOpen && 
        <IntegrationsModal 
            onClose={() => setIsIntegrationsModalOpen(false)} 
            currentCrmSettings={crmSettings}
            currentSlackSettings={slackSettings}
            onSave={handleSaveIntegrations}
        />}
      {toastMessage && <NotificationToast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;