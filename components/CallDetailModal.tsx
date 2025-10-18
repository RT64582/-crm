import React from 'react';
import { AnalysisResult } from '../types';

interface CallDetailModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

const CallDetailModal: React.FC<CallDetailModalProps> = ({ result, onClose }) => {
  
  const getUrgencyClass = (urgency: 'קריטי' | 'גבוהה' | 'בינונית') => {
    switch (urgency) {
      case 'קריטי': return 'bg-red-100 text-red-800';
      case 'גבוהה': return 'bg-yellow-100 text-yellow-800';
      case 'בינונית': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-xl rounded-xl bg-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 className="text-xl leading-6 font-bold text-slate-800">פרטי ניתוח שיחה</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-5 text-right p-2 max-h-[65vh] overflow-y-auto">
          {result.AnalysisStatus === "Completed" ? (
            <>
              <div>
                <h4 className="font-semibold text-slate-700">סיכום מנהלים</h4>
                <p className="text-slate-600 text-sm mt-1">{result.Summary}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700">ציון רגש</h4>
                <p className="text-slate-600 text-sm mt-1">
                  <span className="font-bold">{result.EmotionScore?.Score}/5</span> - {result.EmotionScore?.Explanation}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-700">משימות לביצוע</h4>
                {result.ActionItems && result.ActionItems.length > 0 ? (
                  <ul className="list-disc list-inside mt-1 space-y-2">
                    {result.ActionItems.map((item, index) => (
                      <li key={index} className="text-slate-600 text-sm">
                        {item.Action}
                        <span className={`mr-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getUrgencyClass(item.Urgency)}`}>
                          {item.Urgency}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm mt-1">לא זוהו משימות לביצוע.</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-700">תמלול מקורי</h4>
                <pre className="text-slate-600 text-sm mt-2 bg-slate-50 p-3 rounded-md max-h-40 overflow-y-auto whitespace-pre-wrap font-sans border border-slate-200">
                  {result.originalTranscript}
                </pre>
              </div>
            </>
          ) : (
             <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                    <div className="text-red-500 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-800">ניתוח נכשל</h4>
                        <p className="text-red-700 text-sm mt-1">{result.Message || 'אירעה שגיאה לא ידועה.'}</p>
                    </div>
                </div>
            </div>
          )}
        </div>
        
        <div className="px-2 pt-4 border-t border-slate-200 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-800 text-base font-semibold rounded-lg w-full shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-slate-300 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallDetailModal;
