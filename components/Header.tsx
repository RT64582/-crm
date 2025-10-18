import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenAbout: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenCrm: () => void;
}

const GuideIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const CrmIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenAbout, onOpenGuide, onOpenSettings, onOpenCrm }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V13.5C8 15.433 9.567 17 11.5 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 7L5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17V10.5C16 8.567 14.433 7 12.5 7H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          </div>
          <div>
              <h1 className="text-2xl font-bold text-slate-800">
                LogiFlow AI
              </h1>
              <p className="text-sm text-slate-600">
                מנתח שיחות מבוסס AI לתובנות עסקיות
              </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
            <nav className="hidden sm:flex items-center gap-1">
                <button onClick={onOpenCrm} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-md flex items-center gap-2" title="אינטגרציות"><CrmIcon /> <span className="hidden lg:inline">אינטגרציות</span></button>
                <button onClick={onOpenSettings} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-md flex items-center gap-2" title="הגדרות"><SettingsIcon /> <span className="hidden lg:inline">הגדרות</span></button>
                <button onClick={onOpenGuide} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-md flex items-center gap-2" title="מדריך"><GuideIcon /> <span className="hidden lg:inline">מדריך</span></button>
                <button onClick={onOpenAbout} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-md">אודות</button>
            </nav>
            <div className="h-8 border-l border-slate-200 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 hidden md:inline truncate max-w-xs" title={user.email}>{user.email}</span>
                <button onClick={onLogout} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-2 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200">התנתק</button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
