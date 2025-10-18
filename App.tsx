import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CallAnalysisForm from './components/CallAnalysisForm';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import GuideModal from './components/GuideModal';
import SettingsModal from './components/SettingsModal';
import CrmModal from './components/CrmModal';
import NotificationToast from './components/NotificationToast';
import Login from './components/Login';
import * as authService from './services/authService';
import * as dataService from './services/dataService';
import { AnalysisResult, NotificationSettings, CRMSettings, User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ isEnabled: false, recipients: [] });
  const [crmSettings, setCrmSettings] = useState<CRMSettings>({ crmName: 'None', apiKey: '', autoCreateTasks: false, attachSummary: false });
  
  const [latestError, setLatestError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);

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
      const [loadedResults, loadedNotifications, loadedCrm] = await Promise.all([
          dataService.getAnalysisHistory(user.email),
          dataService.getNotificationSettings(user.email),
          dataService.getCrmSettings(user.email)
      ]);
      setResults(loadedResults);
      setNotificationSettings(loadedNotifications);
      setCrmSettings(loadedCrm);
  };
  
  useEffect(() => {
    // Cleanup timeouts on component unmount
    return () => {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    }
  }, []);

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
  
  const handleSaveCrmSettings = async (settings: CRMSettings) => {
    if (!currentUser) return;
    setCrmSettings(settings);
    await dataService.saveCrmSettings(currentUser.email, settings);
    setIsCrmModalOpen(false);
    triggerToast(`הגדרות CRM עבור ${settings.crmName} נשמרו.`);
  };

  const handleLogin = (user: User) => {
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
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
          <div className="w-16 h-16 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans flex flex-col">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCrm={() => setIsCrmModalOpen(true)}
      />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full">
        {latestError && (
          <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md relative animate-fade-in-down" role="alert">
            <div className="flex items-start">
              <div className="py-1 flex-shrink-0">
                  <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.829a1 1 0 0 0-1.414-1.414L10 8.586 7.172 5.757a1 1 0 0 0-1.414 1.414L8.586 10l-2.829 2.829a1 1 0 1 0 1.414 1.414L10 11.414l2.829 2.829a1 1 0 0 0 1.414-1.414L11.414 10z"/></svg>
              </div>
              <div>
                <p className="font-bold">שגיאה בניתוח האחרון</p>
                <p className="text-sm">{latestError}</p>
              </div>
            </div>
            <button onClick={dismissError} className="absolute top-0 bottom-0 left-0 px-4 py-3" aria-label="סגור הודעה">
               <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>סגור</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Dashboard 
                    results={results} 
                    onClearHistory={clearHistory} 
                />
            </div>
            <div className="lg:col-span-1 lg:sticky lg:top-24">
                <CallAnalysisForm onAnalysisComplete={addAnalysisResult} />
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
       {isCrmModalOpen && 
        <CrmModal 
            onClose={() => setIsCrmModalOpen(false)} 
            currentSettings={crmSettings}
            onSave={handleSaveCrmSettings}
        />}
      {toastMessage && <NotificationToast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;
