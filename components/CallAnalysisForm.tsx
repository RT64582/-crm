import React, { useState, useRef } from 'react';
import { transcribeAudioFile, analyzeCallTranscript } from '../services/geminiService';
import { AnalysisResult } from '../types';
import Loader from './Loader';
import { sampleTranscripts } from '../data/samples';

const sampleTranscript = sampleTranscripts[0];

interface CallAnalysisFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>;


const CallAnalysisForm: React.FC<CallAnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [transcript, setTranscript] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('מנתח תמלול');
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isRecording) {
        mediaRecorderRef.current?.stop();
      }
      setAudioFile(file);
      setTranscript('');
      setError(null);
    }
  };

  const clearAudioFile = () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
    }
    setAudioFile(null);
    const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleToggleRecording = async () => {
      if (isRecording) {
          mediaRecorderRef.current?.stop();
      } else {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              audioStreamRef.current = stream;
              setAudioFile(null);
              setTranscript('');
              setError(null);

              const recorder = new MediaRecorder(stream);
              mediaRecorderRef.current = recorder;
              const chunks: Blob[] = [];

              recorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                      chunks.push(event.data);
                  }
              };

              recorder.onstop = () => {
                  if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                    setAudioFile(file);
                  }
                  setIsRecording(false);
                  stream.getTracks().forEach(track => track.stop());
                  audioStreamRef.current = null;
              };

              recorder.onerror = (event) => {
                  console.error("MediaRecorder error:", event);
                  setError("אירעה שגיאה במהלך ההקלטה. ייתכן שההרשאות השתנו או שההתקן נותק.");
                  setIsRecording(false);
                  stream.getTracks().forEach(track => track.stop());
                  audioStreamRef.current = null;
              };

              recorder.start();
              setIsRecording(true);

          } catch (err) {
              console.error("Error accessing microphone:", err);
              if (err instanceof DOMException) {
                if (err.name === 'NotFoundError') {
                    setError("לא נמצא מיקרופון. אנא ודא שהתקן שמע מחובר ומוכן לשימוש.");
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError("הגישה למיקרופון נדחתה. אנא אפשר גישה בהגדרות הדפדפן ורענן את הדף.");
                } else {
                    setError(`אירעה שגיאה בגישה למיקרופון: ${err.message}`);
                }
              } else {
                 setError("לא ניתן לגשת למיקרופון. אנא אשר את ההרשאה בדפדפן.");
              }
          }
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim() && !audioFile) {
      setError('אנא הזן תמלול, הקלט שמע או העלה קובץ לניתוח.');
      return;
    }
    setError(null);
    setIsLoading(true);

    let transcriptToAnalyze = transcript;

    if (audioFile) {
      try {
        setLoadingMessage('מתמלל שמע...');
        transcriptToAnalyze = await transcribeAudioFile(audioFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בתמלול קובץ השמע.');
        setIsLoading(false);
        setLoadingMessage('נתח תמלול');
        return;
      }
    }

    setLoadingMessage('מנתח תוכן...');
    const result = await analyzeCallTranscript(transcriptToAnalyze);
    onAnalysisComplete(result);

    if (result.AnalysisStatus === 'Error') {
      setError(result.Message || 'אירעה שגיאה לא צפויה במהלך הניתוח.');
    } else {
      setTranscript('');
      clearAudioFile();
    }
    
    setIsLoading(false);
    setLoadingMessage('נתח תמלול');
  };
  
  const loadSample = () => {
    setTranscript(sampleTranscript);
    clearAudioFile();
    setError(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">ניתוח שיחה חדשה</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="transcript" className="block text-sm font-medium text-slate-600 mb-2">
            הדבק כאן את תמלול השיחה
          </label>
          <textarea
            id="transcript"
            rows={8}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-inner bg-slate-50 text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
            placeholder="[נציג]: שלום, איך אוכל לעזור?&#10;[לקוח]: שלום, יש לי שאלה על..."
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              if (audioFile) clearAudioFile();
            }}
            disabled={isLoading || !!audioFile || isRecording}
            aria-label="תמלול השיחה"
          />
        </div>

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-slate-500">או</span>
            </div>
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
                העלה קובץ שמע או הקלט
            </label>
            <div className="flex items-stretch gap-3">
                 <label htmlFor="audio-upload" className={`cursor-pointer bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex-grow text-center ${isLoading || isRecording ? 'cursor-not-allowed bg-slate-200' : ''}`}>
                    {audioFile && !audioFile.name.startsWith('recording-') ? 'החלף קובץ' : 'בחר קובץ'}
                 </label>
                 <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isLoading || isRecording}
                 />
                 <button 
                  type="button" 
                  onClick={handleToggleRecording}
                  disabled={isLoading || !!transcript.trim()}
                  className={`flex items-center justify-center px-4 py-2 border rounded-lg font-semibold text-sm transition-colors w-36 ${
                    isRecording 
                    ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:bg-slate-200 disabled:cursor-not-allowed'
                  }`}
                 >
                  {isRecording ? <><StopIcon /><span className="mr-2">הפסק</span></> : <><MicIcon /><span className="mr-2">הקלט</span></>}
                 </button>
            </div>
            {isRecording && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    מקליט...
                </div>
            )}
            {audioFile && (
                <div className="flex items-center gap-2 overflow-hidden mt-2">
                    <span className="text-sm text-slate-600 truncate" title={audioFile.name}>{audioFile.name}</span>
                    <button type="button" onClick={clearAudioFile} disabled={isLoading} className="text-red-500 hover:text-red-700 font-bold text-lg flex-shrink-0" aria-label="נקה קובץ">&times;</button>
                </div>
            )}
             <p className="text-xs text-slate-500 mt-2">
                התמלול האוטומטי תומך בפורמטים נפוצים (MP3, WAV, WEBM ועוד).
            </p>
        </div>


        {error && (
            <div className="bg-red-50 border-r-4 border-red-400 text-red-800 p-4 my-3 rounded-l-lg" role="alert">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                       <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                           <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM9 9a1 1 0 0 0 2 0V7a1 1 0 1 0-2 0v2zm0 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>
                       </svg>
                    </div>
                    <div className="mr-3">
                        <p className="text-sm font-semibold">{error}</p>
                    </div>
                </div>
            </div>
        )}
        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-5">
          <button
            type="submit"
            disabled={isLoading || isRecording || (!transcript.trim() && !audioFile)}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm flex justify-center items-center"
          >
            {isLoading ? <><Loader /> <span className="mr-2">{loadingMessage}</span></> : 'נתח'}
          </button>
           <button
            type="button"
            onClick={loadSample}
            disabled={isLoading || isRecording}
            className="w-full bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-300 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors border border-slate-300"
          >
            טען דוגמה
          </button>
        </div>
      </form>
    </div>
  );
};

export default CallAnalysisForm;