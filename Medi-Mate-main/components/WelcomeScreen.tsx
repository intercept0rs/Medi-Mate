import React from 'react';
import { TranslationSet } from '../types';
import Logo from './Logo';

interface WelcomeScreenProps {
    onShowLogin: () => void;
    onShowSignup: () => void;
    t: TranslationSet;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onShowLogin, onShowSignup, t }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-black animate-gradient-pan overflow-hidden">
            <div className="w-full max-w-sm text-center">
                <Logo 
                    className="h-24 mx-auto animate-slide-in-up" 
                    style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
                />
                <h1 
                    className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-4 animate-slide-in-up"
                    style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
                >
                    {t.authWelcome}
                </h1>
                
                <div className="mt-16 space-y-4">
                    <div 
                        className="animate-slide-in-up" 
                        style={{ animationDelay: '400ms', opacity: 0, animationFillMode: 'forwards' }}
                    >
                        <button 
                            onClick={onShowSignup} 
                            className="w-full p-4 font-semibold rounded-lg transition-all duration-300 bg-[#0C8346] text-white hover:bg-green-800 shadow-lg hover:shadow-green-800/30 text-lg transform hover:scale-105"
                        >
                            {t.createProfile}
                        </button>
                    </div>

                    <div 
                        className="animate-slide-in-up" 
                        style={{ animationDelay: '500ms', opacity: 0, animationFillMode: 'forwards' }}
                    >
                         <button 
                             onClick={onShowLogin} 
                             className="w-full p-3 font-semibold rounded-lg transition-colors duration-300 border-2 border-[#0C8346] dark:border-[#92D050] group hover:bg-[#0C8346] dark:hover:bg-[#92D050]"
                         >
                           <span className="text-slate-600 dark:text-slate-300 group-hover:text-white dark:group-hover:text-gray-900 transition-colors">
                                {t.authLoginPrompt}{' '}
                                <span className="font-bold text-[#0C8346] dark:text-[#92D050] group-hover:text-white dark:group-hover:text-gray-900 transition-colors">
                                    {t.login}
                                </span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;