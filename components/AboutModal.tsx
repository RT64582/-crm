import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-xl rounded-xl bg-brand-card border-brand-border" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <h3 className="text-xl leading-6 font-bold text-slate-100">אודות LogiFlow AI</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-5 text-right p-2 max-h-[70vh] overflow-y-auto">
            <div>
                <h4 className="font-semibold text-indigo-400 text-lg">מה זה LogiFlow AI?</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    LogiFlow AI הוא כלי ניתוח שיחות חכם שנועד להפוך תמלולים גולמיים לתובנות עסקיות יקרות ערך. באמצעות בינה מלאכותית מתקדמת מבית Google, המערכת ממצה באופן אוטומטי סיכומים, מזהה את רגש הלקוח ומפיקה משימות ברורות לפעולה - כל זאת בממשק נקי ואינטואיטיבי.
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-indigo-400 text-lg">יכולות ליבה</h4>
                <ul className="list-disc list-inside mt-2 space-y-2 text-sm text-slate-400">
                    <li><span className="font-semibold text-slate-300">תמלול אודיו אמיתי:</span> המרת קבצי שמע של שיחות לטקסט מדויק.</li>
                    <li><span className="font-semibold text-slate-300">סיכום מנהלים:</span> הפקת תקציר תמציתי של עיקרי השיחה.</li>
                    <li><span className="font-semibold text-slate-300">ניתוח רגש:</span> הערכת שביעות רצון הלקוח עם ציון והסבר.</li>
                    <li><span className="font-semibold text-slate-300">זיהוי משימות:</span> חילוץ אוטומטי של משימות ומטלות מהשיחה עם קביעת דחיפות.</li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold text-indigo-400 text-lg">טכנולוגיה</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    הפלטפורמה מונעת על ידי מודלי השפה המתקדמים של Google Gemini, המאפשרים הבנה וניתוח של שפה טבעית ברמה הגבוהה ביותר.
                </p>
            </div>
             <div>
                <h4 className="font-semibold text-indigo-400 text-lg">פיתוח</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    פותח ועוצב ע״י מעבדות Apptik.
                </p>
            </div>
        </div>
        
        <div className="px-2 pt-4 border-t border-slate-700 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-slate-300 text-base font-semibold rounded-lg w-full shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-card focus:ring-indigo-500 border border-brand-border transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;