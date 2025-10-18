import React, { useEffect, useState } from 'react';

interface NotificationToastProps {
  message: string;
  onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade in animation
    setIsVisible(true);

    // Set a timer to start the fade out animation
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5500); // Start fading out 500ms before it's dismissed

    // The parent component will handle the actual dismissal after 6000ms
    return () => {
      clearTimeout(fadeOutTimer);
    };
  }, [message]);

  return (
    <div 
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-md p-4 rounded-xl shadow-2xl bg-slate-800 text-white border border-slate-700 z-50 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        role="alert"
        aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </div>
        <p className="flex-grow text-sm font-medium">{message}</p>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white rounded-full p-1 -mr-2 -mt-1"
          aria-label="סגור התראה"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;