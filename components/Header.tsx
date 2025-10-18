import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenAbout: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenIntegrations: () => void;
  onToggleAnalysisSidebar: () => void;
}

const GuideIcon = () => (<svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const CrmIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);


const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenAbout, onOpenGuide, onOpenSettings, onOpenIntegrations, onToggleAnalysisSidebar }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const createMenuHandler = (handler: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    handler();
    setIsMenuOpen(false);
  };


  return (
    <header className="bg-brand-dark/80 backdrop-blur-sm sticky top-0 z-40 border-b border-brand-border">
      <div className="container mx-auto px-4 py-3 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V13.5C8 15.433 9.567 17 11.5 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 7L5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17V10.5C16 8.567 14.433 7 12.5 7H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          </div>
          <div>
              <h1 className="text-2xl font-bold text-slate-100">
                LogiFlow AI
              </h1>
              <p className="text-sm text-slate-400 hidden sm:block">
                מנתח שיחות מבוסס AI לתובנות עסקיות
              </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onToggleAnalysisSidebar}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-indigo-500"
                aria-label="הצג/הסתר טופס ניתוח חדש"
            >
                <PlusIcon />
                <span className="hidden md:inline">ניתוח חדש</span>
            </button>
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                aria-label="תפריט ראשי"
              >
                <MenuIcon />
              </button>
              
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-brand-card ring-1 ring-white/10 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                >
                  <div className="px-4 py-3 border-b border-brand-border">
                    <p className="text-sm text-slate-400">מחובר בתור</p>
                    <p className="text-sm font-medium text-slate-200 truncate" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1" role="none">
                    <a href="#" onClick={createMenuHandler(onOpenIntegrations)} className="text-slate-300 group flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-indigo-400" role="menuitem">
                      <CrmIcon />
                      <span className="mr-3">אינטגרציות</span>
                    </a>
                    <a href="#" onClick={createMenuHandler(onOpenSettings)} className="text-slate-300 group flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-indigo-400" role="menuitem">
                      <SettingsIcon />
                      <span className="mr-3">הגדרות</span>
                    </a>
                    <a href="#" onClick={createMenuHandler(onOpenGuide)} className="text-slate-300 group flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-indigo-400" role="menuitem">
                       <GuideIcon />
                       <span className="mr-3">מדריך שימוש</span>
                    </a>
                     <a href="#" onClick={createMenuHandler(onOpenAbout)} className="text-slate-300 group flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 hover:text-indigo-400" role="menuitem">
                       <InfoIcon />
                       <span className="mr-3">אודות המערכת</span>
                    </a>
                  </div>
                  <div className="py-1 border-t border-brand-border">
                     <a href="#" onClick={createMenuHandler(onLogout)} className="text-red-400 group flex items-center w-full px-4 py-2 text-sm hover:bg-red-500/10 hover:text-red-300" role="menuitem">
                       <LogoutIcon />
                       <span className="mr-3">התנתק</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;