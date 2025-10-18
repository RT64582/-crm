
import React, { useState } from 'react';
import * as authService from '../services/authService';
import { User } from '../types';
import Loader from './Loader';

interface LoginProps {
  onLogin: (user: User) => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
        <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.342A8.8 8.8 0 0 1 8.842 18.083Z" clipRule="evenodd"/>
    </svg>
);


const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('אנא הזן כתובת אימייל תקינה.');
      return;
    }
    if (password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
        return;
    }
    
    setError('');
    setIsLoading(true);

    try {
        const authFunction = isRegister ? authService.registerWithEmail : authService.signInWithEmail;
        const result = await authFunction(email.trim(), password);
        onLogin(result.user);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'אירעה שגיאה בתהליך האימות.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      onLogin(result.user);
    } catch (err) {
      if (err instanceof Error) {
        // Don't show an error if the user just cancelled the prompt
        if (!err.message.includes('בוטלה')) {
            setError(err.message);
        }
      } else {
        setError('אירעה שגיאה לא צפויה בכניסה עם גוגל.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="bg-brand-dark min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V13.5C8 15.433 9.567 17 11.5 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 7L5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17V10.5C16 8.567 14.433 7 12.5 7H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-100">LogiFlow AI</h1>
            <p className="text-md text-slate-400 mt-1">
              {isRegister ? 'צור חשבון חדש' : 'התחבר כדי להתחיל לנתח שיחות'}
            </p>
        </div>

        <div className="bg-brand-card/70 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-brand-border">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
                כתובת אימייל
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-inner bg-slate-900/50 text-sm text-slate-200 placeholder-slate-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isGoogleLoading}
              />
            </div>
             <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-2">
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-inner bg-slate-900/50 text-sm text-slate-200 placeholder-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                disabled={isGoogleLoading}
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:bg-slate-600 disabled:cursor-wait transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex justify-center items-center"
            >
              {isLoading ? <Loader /> : (isRegister ? 'הרשם' : 'התחבר')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-brand-card/70 px-2 text-sm text-slate-500" style={{top: '-0.1rem', backgroundColor: 'rgb(30 41 59 / var(--tw-bg-opacity))'}}>או</span>
            </div>
          </div>
          
           <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex justify-center items-center gap-2 bg-white text-slate-800 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 disabled:bg-slate-500 disabled:cursor-wait transition-all shadow-md active:scale-95"
            >
              {isGoogleLoading ? <Loader /> : <><GoogleIcon /><span className="text-sm">המשך עם גוגל</span></>}
            </button>


           <div className="text-center mt-6">
                <button 
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setError('');
                    }}
                    disabled={isGoogleLoading}
                    className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {isRegister ? 'יש לך כבר חשבון? התחבר' : 'אין לך חשבון? הרשם'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
