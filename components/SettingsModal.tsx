import React, { useState } from 'react';
import { NotificationSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  currentSettings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, currentSettings, onSave }) => {
  const [isEnabled, setIsEnabled] = useState(currentSettings.isEnabled);
  const [recipients, setRecipients] = useState(currentSettings.recipients);
  const [newRecipient, setNewRecipient] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleAddRecipient = () => {
    const trimmedRecipient = newRecipient.trim();
    if (!trimmedRecipient) return;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedRecipient)) {
      setEmailError('אנא הזן כתובת אימייל תקינה.');
      return;
    }
    
    // Check for duplicates, case-insensitively for better UX
    if (recipients.some(r => r.toLowerCase() === trimmedRecipient.toLowerCase())) {
      setEmailError('כתובת אימייל זו כבר קיימת ברשימה.');
      return;
    }

    setRecipients([...recipients, trimmedRecipient]);
    setNewRecipient('');
    setEmailError('');
  };

  const handleRemoveRecipient = (recipientToRemove: string) => {
    setRecipients(recipients.filter(r => r !== recipientToRemove));
  };

  const handleSave = () => {
    onSave({ isEnabled, recipients });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddRecipient();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-xl rounded-xl bg-brand-card border-brand-border" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <h3 className="text-xl leading-6 font-bold text-slate-100">הגדרות התראות</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-6 text-right p-2 max-h-[70vh] overflow-y-auto">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-brand-border">
                <div>
                    <h4 className="font-semibold text-slate-200">התראות על משימות קריטיות</h4>
                    <p className="text-sm text-slate-400">קבל התראה כאשר מזוהה משימה בדחיפות "קריטית".</p>
                </div>
                <label htmlFor="toggle-notifications" className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="toggle-notifications" 
                        className="sr-only peer" 
                        checked={isEnabled}
                        onChange={() => setIsEnabled(!isEnabled)}
                    />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {/* Recipients Management */}
            <div className={`transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <h4 className="font-semibold text-slate-300 mb-2">נמענים לקבלת התראות</h4>
                <div className="flex items-start gap-2">
                    <div className="flex-grow">
                        <input
                            type="email"
                            placeholder="הזן כתובת אימייל"
                            className="w-full p-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-900/50 text-slate-200"
                            value={newRecipient}
                            onChange={(e) => {
                                setNewRecipient(e.target.value);
                                if (emailError) setEmailError('');
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={!isEnabled}
                            aria-label="הוסף נמען חדש"
                        />
                         {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
                    </div>
                    <button
                        onClick={handleAddRecipient}
                        className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
                        disabled={!isEnabled || !newRecipient.trim()}
                    >
                        הוסף
                    </button>
                </div>
               

                <div className="mt-4 space-y-2">
                    {recipients.length > 0 ? (
                        recipients.map(recipient => (
                            <div key={recipient} className="flex justify-between items-center bg-white/5 p-2 border border-brand-border rounded-md">
                                <span className="text-sm text-slate-300 dir-ltr text-left">{recipient}</span>
                                <button
                                    onClick={() => handleRemoveRecipient(recipient)}
                                    className="text-red-400 hover:text-red-300 font-bold p-1 rounded-full text-lg"
                                    aria-label={`הסר את ${recipient}`}
                                >
                                    &times;
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">אין נמענים שהוגדרו.</p>
                    )}
                </div>
            </div>
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

export default SettingsModal;