import React, { useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import Loader from './Loader';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthView = 'login' | 'register' | 'forgotPassword';

const GoogleIcon = () => (
    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4 0 129.2 110.3 20 244 20c65.2 0 118.3 24.3 159.5 61.4l-64.2 62.3c-23.1-21.6-55.2-35.4-95.3-35.4-74.3 0-134.3 61.5-134.3 137.1 0 75.6 60 137.1 134.3 137.1 84.4 0 116.2-64.3 120.2-97.1H244V261.8h244z"></path>
    </svg>
);


const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  
  // State for forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // State for the progressive 2FA flow
  const [show2FAInput, setShow2FAInput] = useState(false);
  const [pending2FAUser, setPending2FAUser] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const resetFormState = (newView: AuthView) => {
    setView(newView);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTwoFactorCode('');
    setShow2FAInput(false);
    setPending2FAUser(null);
    setError('');
    setSuccessMessage('');
  };

  const handlePrimaryLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (show2FAInput) {
      await handle2FASubmit();
    } else {
      await handleCredentialSubmit();
    }
  };

  const handleCredentialSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('יש למלא אימייל וסיסמה.');
      return;
    }
    
    setIsLoading(true);
    const result = await authService.authenticateCredentials(email, password);
    setIsLoading(false);

    if (result.status === 'SUCCESS' && result.user) {
      onLogin(result.user);
    } else if (result.status === '2FA_REQUIRED' && result.user) {
      setPending2FAUser(result.user);
      setShow2FAInput(true); // Reveal the 2FA input
    } else {
      setError(result.error || 'אירעה שגיאה לא צפויה.');
    }
  };
  
  const handle2FASubmit = async () => {
    setError('');
    if (!pending2FAUser || !/^\d{6}$/.test(twoFactorCode)) {
      setError('הקוד חייב להיות בן 6 ספרות.');
      return;
    }

    setIsLoading(true);
    const result = await authService.verify2FACode(pending2FAUser.email, twoFactorCode);
    setIsLoading(false);

    if (result.status === 'SUCCESS') {
        onLogin(pending2FAUser);
    } else {
        setError(result.error || 'אימות הקוד נכשל.');
        setTwoFactorCode(''); // Clear the code on failure for re-entry
    }
  };


  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
        setError('הסיסמאות אינן תואמות.');
        return;
    }
     if (password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
        return;
    }

    setIsLoading(true);
    const result = await authService.registerWithEmail(email, password);
    setIsLoading(false);

    if (result.status === 'SUCCESS' && result.user) {
        onLogin(result.user);
    } else {
        setError(result.error || 'ההרשמה נכשלה.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const result = await authService.authenticateWithGoogle();
    setIsLoading(false);
    if (result.status === 'SUCCESS' && result.user) {
        onLogin(result.user);
    }
  };
  
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await authService.requestPasswordReset(email);
    setIsLoading(false);
    setSuccessMessage(result.message);
  };
  
  
  const handleStartOver = () => {
    setShow2FAInput(false);
    setPending2FAUser(null);
    setTwoFactorCode('');
    setError('');
  };

  const renderHeader = () => {
      let title = 'כניסה ל-LogiFlow AI';
      let subtitle = 'הזן את פרטיך כדי לגשת ללוח הבקרה';
      if (view === 'register') {
          title = 'יצירת חשבון חדש';
          subtitle = 'מלא את הפרטים כדי להתחיל לנתח שיחות';
      } else if (view === 'forgotPassword') {
          title = 'איפוס סיסמה';
          subtitle = 'הזן את כתובת האימייל שלך כדי לקבל הוראות';
      }
      return (
          <>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-100">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </>
      );
  }

  const renderContent = () => {
    if (view === 'forgotPassword') {
        return (
            <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
                <input id="email-address" name="email" type="email" required className="relative block w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" placeholder="כתובת אימייל" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" disabled={isLoading} className="group relative flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 py-3 px-4 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed">{isLoading ? <Loader /> : 'שלח הוראות'}</button>
                <div className="text-center">
                    <button type="button" onClick={() => resetFormState('login')} className="font-medium text-sm text-indigo-400 hover:text-indigo-300">חזרה להתחברות</button>
                </div>
            </form>
        );
    }

    return (
        <>
            <div className="flex border-b border-slate-700">
                <button onClick={() => resetFormState('login')} className={`flex-1 py-3 text-sm font-semibold ${view === 'login' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>התחברות</button>
                <button onClick={() => resetFormState('register')} className={`flex-1 py-3 text-sm font-semibold ${view === 'register' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>הרשמה</button>
            </div>
            <div className="pt-6">
                <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-600 rounded-lg bg-white/5 text-slate-200 hover:bg-white/10 text-sm font-semibold transition-colors disabled:opacity-50">
                    <GoogleIcon /> המשך עם גוגל
                </button>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
                    <div className="relative flex justify-center text-sm"><span className="bg-brand-card px-2 text-slate-500">או המשך עם אימייל</span></div>
                </div>
                {view === 'login' && (
                     <form className="space-y-4" onSubmit={handlePrimaryLoginSubmit}>
                        <div>
                           <label htmlFor="email-login" className="sr-only">כתובת אימייל</label>
                           <input id="email-login" type="email" required className="w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed" placeholder="כתובת אימייל" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || show2FAInput} />
                        </div>
                        <div>
                          <label htmlFor="password-login" className="sr-only">סיסמה</label>
                          <input id="password-login" type="password" required className="w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || show2FAInput} />
                        </div>

                        {show2FAInput && (
                            <div className="animate-fade-in-down pt-2">
                                <label htmlFor="2fa-code" className="block text-sm font-semibold text-indigo-300 mb-2 text-center">קוד אימות דו-שלבי</label>
                                <input id="2fa-code" type="tel" required autoFocus maxLength={6} className="relative block w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-3 text-center text-xl tracking-[0.5rem] text-slate-200 placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" placeholder="------" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} disabled={isLoading} />
                            </div>
                        )}

                        <div className="text-right">
                            <button 
                                type="button" 
                                onClick={show2FAInput ? handleStartOver : () => resetFormState('forgotPassword')} 
                                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                                disabled={isLoading}
                            >
                                {show2FAInput ? 'התחל מחדש' : 'שכחת סיסמה?'}
                            </button>
                        </div>
                        <button type="submit" disabled={isLoading || (show2FAInput && twoFactorCode.length !== 6)} className="w-full justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center">
                            {isLoading ? <Loader /> : (show2FAInput ? 'אמת קוד' : 'התחבר')}
                        </button>
                    </form>
                )}
                 {view === 'register' && (
                     <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                        <input id="email-register" type="email" required className="w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" placeholder="כתובת אימייל" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input id="password-register" type="password" required className="w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" placeholder="סיסמה (6+ תווים)" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <input id="confirm-password" type="password" required className="w-full appearance-none rounded-md border border-slate-600 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" placeholder="אימות סיסמה" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <button type="submit" disabled={isLoading} className="w-full justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:bg-slate-600 flex items-center">{isLoading ? <Loader /> : 'צור חשבון'}</button>
                    </form>
                )}
            </div>
        </>
    );
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7V13.5C8 15.433 9.567 17 11.5 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 7L5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17V10.5C16 8.567 14.433 7 12.5 7H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {renderHeader()}
        </div>
        <div className="bg-brand-card/70 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-brand-border">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm mb-4" role="alert">{error}</div>}
          {successMessage && <div className="bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-3 rounded-lg text-sm mb-4" role="alert">{successMessage}</div>}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;