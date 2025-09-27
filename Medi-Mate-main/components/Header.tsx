import React from 'react';
import { Language, UserRole, Theme, TranslationSet, AppView } from '../types';
import Logo from './Logo';
import { MoonIcon, SunIcon, ChevronDownIcon, UserIcon, ChevronLeftIcon } from './icons';

interface HeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    userRole: UserRole;
    t: TranslationSet;
    theme: Theme;
    toggleTheme: () => void;
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    handleBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ t, theme, toggleTheme, language, setLanguage, currentView, setCurrentView, handleBack }) => {
    
    return (
        <header className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-lg sticky top-0 z-10">
            {currentView === AppView.Profile ? (
                <button onClick={handleBack} className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold">
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>{t.back}</span>
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <Logo className="h-8" />
                </div>
            )}
            <div className="flex items-center gap-4">
                 <div className="relative">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="text-sm rounded-md py-1 pl-2 pr-8 appearance-none bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C8346]"
                    >
                        <option value="en">EN</option>
                        <option value="ml">ML</option>
                        <option value="hi">HI</option>
                    </select>
                    <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
                <button onClick={toggleTheme} aria-label={t.toggleTheme} className="text-slate-600 dark:text-slate-300">
                    {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
                </button>
                 {currentView !== AppView.Profile && (
                    <button 
                        onClick={() => setCurrentView(AppView.Profile)} 
                        aria-label={t.navProfile} 
                        className="relative p-1 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-gray-700"
                    >
                        <UserIcon className="w-6 h-6 text-slate-600 dark:text-slate-300"/>
                    </button>
                 )}
            </div>
        </header>
    );
};

export default Header;