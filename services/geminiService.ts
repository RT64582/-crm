import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// FIX: Initialize GoogleGenAI client as per coding guidelines.
// The API key is assumed to be pre-configured and available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    AnalysisStatus: { type: Type.STRING, enum: ["Completed", "Error"] },
    Summary: { type: Type.STRING, description: "תקציר ענייני ב-3 משפטים מדויקים (אורך מקסימלי 60 מילים)." },
    EmotionScore: {
      type: Type.OBJECT,
      properties: {
        Score: { type: Type.INTEGER, description: "ציון 1-5 (1 = כעס/תסכול גבוה, 5 = שביעות רצון/עניין גבוה)." },
        Explanation: { type: Type.STRING, description: "משפט אחד המסביר את הדירוג." }
      },
      required: ["Score", "Explanation"]
    },
    ActionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          Action: { type: Type.STRING, description: "תיאור המשימה (לדוגמה: 'שליחת קטלוג המעודכן')." },
          Urgency: { type: Type.STRING, enum: ["קריטי", "גבוהה", "בינונית"] }
        },
        required: ["Action", "Urgency"]
      }
    },
    Message: { type: Type.STRING, description: "הודעת שגיאה אם הקלט לא רלוונטי." }
  }
};

// Helper function to convert File to a base64 string for the API
function fileToGenerativePart(file: File): Promise<{mimeType: string, data: string}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject('Failed to read file as base64 string.');
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function transcribeAudioFile(file: File): Promise<string> {
    try {
        const audioPart = await fileToGenerativePart(file);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: "תמלל את קובץ השמע הבא. ספק רק את התמלול הטקסטואלי של השיחה, ללא תוספות או הסברים." },
                    { inlineData: audioPart }
                ]
            }
        });

        const transcript = response.text;
        if (!transcript) {
            throw new Error("התמלול חזר ריק.");
        }
        return transcript;
    } catch (error) {
        console.error("Error transcribing audio file:", error);
        if (error instanceof Error && error.message.includes('API key')) {
          throw new Error("מפתח ה-API אינו תקין או חסר. אנא ודא שהמפתח הוגדר כראוי.");
        }
        throw new Error("לא ניתן היה לתמלל את קובץ השמע. ייתכן שהוא פגום או בפורמט שאינו נתמך.");
    }
}


export async function analyzeCallTranscript(transcript: string): Promise<AnalysisResult> {
  const prompt = `
    תפקיד: אתה אנליסט מכירות אוטומטי (LogiFlow AI) ברמת קצה. המשימה שלך היא לנתח תמלולי שיחות שירות או מכירה, להפוך אותם לנתונים עסקיים קריטיים, ולמנוע אובדן לידים. כל הפעולה חייבת להתבצע במהירות בזק ובאפס שגיאות.

    קלט:
    ${transcript}

    דרישות מתודולוגיות קצה (הוראות חובה ל-AI):
    1.  אימות קלט: אם הקלט ריק או לא רלוונטי לשיחה עסקית, הפק פלט JSON יחיד: {"AnalysisStatus": "Error", "Message": "הקלט אינו רלוונטי או ריק. אנא ספק תמלול של שיחה עסקית."}.
    2.  דיוק וטון: הפק את כל הפלט בעברית רשמית וברורה.
    3.  פלט בלעדי: הפלט היחיד המותר הוא בלוק קוד JSON. אין להוסיף פרוזות, הסברים, כותרות או טקסט נוסף לפני או אחרי בלוק ה-JSON.

    משימות ליבה (הערך העסקי הממוקסם):
    1.  סיכום אובייקטיבי: ספק תקציר ענייני ב-3 משפטים מדויקים (אורך מקסימלי 60 מילים).
    2.  ניתוח רגש: דרג את שביעות רצון הלקוח מהשיחה.
        * **ציון:** 1 עד 5 (1 = כעס/תסכול גבוה, 5 = שביעות רצון/עניין גבוה).
        * **הסבר:** משפט אחד המסביר את הדירוג.
    3.  כריית משימות: זהה והפק רשימת פעולות קונקרטיות הדרושות לנציג ההמשך.
        * **פעולה:** תיאור המשימה (לדוגמה: "שליחת קטלוג המעודכן").
        * **דחיפות:** קבע רמת דחיפות: "קריטי" / "גבוהה" / "בינונית".
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });
    
    const jsonText = response.text.trim();
    
    try {
        const parsedResult = JSON.parse(jsonText);
        return {
            ...parsedResult,
            id: crypto.randomUUID(),
            originalTranscript: transcript,
            timestamp: new Date().toISOString(),
        };
    } catch (parseError) {
        console.error("Error parsing AI response:", parseError, "\nRaw text received:", jsonText);
        return {
            id: crypto.randomUUID(),
            AnalysisStatus: "Error",
            Message: "שירות ה-AI החזיר תשובה בפורמט לא תקין. ייתכן שהתמלול לא היה ברור מספיק. נסה שוב או שנה את הקלט.",
            originalTranscript: transcript,
            timestamp: new Date().toISOString(),
        };
    }

  } catch (error) {
    console.error("Error analyzing transcript:", error);
    let userMessage = "אירעה שגיאת תקשורת עם שירות ה-AI. אנא בדוק את חיבור האינטרנט שלך ונסה שוב.";
    if (error instanceof Error && error.message.includes('API key')) {
        userMessage = "מפתח ה-API אינו תקין או חסר. אנא ודא שהמפתח הוגדר כראוי.";
    }
    return {
      id: crypto.randomUUID(),
      AnalysisStatus: "Error",
      Message: userMessage,
      originalTranscript: transcript,
      timestamp: new Date().toISOString(),
    };
  }
}
