import React from 'react';

interface GuideModalProps {
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
    const codeExample = `
async function updateCRM(analysisResult) {
  const { Summary, ActionItems } = analysisResult;

  // Example: create a task for the first critical action item
  const criticalTask = ActionItems.find(
    item => item.Urgency === 'קריטי'
  );

  if (criticalTask) {
    const crmPayload = {
      task_title: criticalTask.Action,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
      notes: \`Summary of the call:\\n\${Summary}\`,
      // ... other relevant fields like contact_id
    };

    // Replace with your actual CRM API client
    await crmApiClient.post('/tasks', crmPayload);
  }
}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative mx-auto p-6 border w-full max-w-3xl shadow-xl rounded-xl bg-brand-card border-brand-border" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <h3 className="text-xl leading-6 font-bold text-slate-100">מדריך לחיבור ל-CRM</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-5 text-right p-2 max-h-[70vh] overflow-y-auto">
            <div>
                <h4 className="font-semibold text-indigo-400 text-lg">מבוא</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    כדי למקסם את הערך מ-LogiFlow AI, מומלץ לחבר את התובנות ישירות למערכת ה-CRM שלכם. מדריך זה מספק סקירה רעיונית למפתחים כיצד לבצע אינטגרציה אוטומטית.
                </p>
            </div>

            <div>
                <h4 className="font-semibold text-indigo-400 text-lg">שלב 1: ייצוא ידני (ללא קוד)</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    ניתן להשתמש בכפתור "יצא ל-CSV" בלוח הבקרה כדי להוריד את נתוני הניתוחים. לאחר מכן, ניתן לייבא את קובץ ה-CSV למערכת ה-CRM שלכם בהתאם ליכולותיה.
                </p>
            </div>

            <div>
                <h4 className="font-semibold text-indigo-400 text-lg">שלב 2: אינטגרציה אוטומטית (למפתחים)</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                   זרימת עבודה אוטומטית דורשת שירות צד-שרת (backend) שישמש כגשר בין ניתוח ה-AI ל-API של ה-CRM.
                   <br/>
                   <strong className="font-semibold text-slate-300">תרשים זרימה:</strong> 
                   <code className="text-xs text-slate-500">קובץ שמע/טקסט ➔ ניתוח ב-Gemini API ➔ שירות ה-Backend שלכם ➔ קריאת API ל-CRM (למשל, יצירת משימה)</code>.
                </p>
                 <p className="text-slate-300 text-sm mt-3 font-semibold">דוגמת קוד (Pseudo-code ב-Node.js):</p>
                 <pre className="text-sm mt-2 bg-brand-dark p-4 rounded-md max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-left dir-ltr border border-slate-700">
                  <code className="text-slate-300">
                    {codeExample.trim()}
                  </code>
                </pre>
            </div>
            
            <div>
                <h4 className="font-semibold text-indigo-400 text-lg">הערות אבטחה חשובות</h4>
                 <div className="bg-yellow-500/10 border-r-4 border-yellow-500 text-yellow-300 p-4 my-2 rounded-l-lg text-sm">
                    יש לאחסן תמיד את מפתח ה-API של Gemini ואת מפתחות ה-API של ה-CRM בצד השרת באופן מאובטח. <strong className="font-semibold">לעולם אין לחשוף מפתחות אלו בקוד צד-לקוח (frontend).</strong>
                </div>
            </div>

             <div>
                <h4 className="font-semibold text-indigo-400 text-lg">כתב ויתור</h4>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    מדריך זה הוא רעיוני בלבד. היישום בפועל תלוי בפלטפורמת ה-CRM הספציפית ובתשתית הטכנולוגית שלכם.
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

export default GuideModal;