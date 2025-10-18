import React, { useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('יש להזין כתובת אימייל.');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('כתובת האימייל אינה תקינה.');
      return;
    }
    setError('');
    
    // In a real app, you would call a backend service.
    // Here we simulate it with our authService.
    const user = authService.login(email);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-xl p-8">
            <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg mb-4">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7V13.5C8 15.433 9.567 17 11.5 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 7L5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17V10.5C16 8.567 14.433 7 12.5 7H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-800">LogiFlow AI</h1>
                <p className="text-slate-500 mt-1">אנא התחבר כדי להמשיך</p>
            </div>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">
                כתובת אימייל
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-inner bg-slate-50"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 my-3 rounded-lg text-sm" role="alert">
                <p>{error}</p>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-colors shadow-sm"
              >
                התחברות / הרשמה
              </button>
            </div>
            <div className="mt-4 text-center">
                <p className="text-xs text-slate-400">
                    זוהי גרסת דמו. כל כתובת אימייל תקינה תתקבל.
                </p>
            </div>
          </form>
        </div>
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>פותח ועוצב ע״י מעבדות Apptik</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
