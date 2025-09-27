import React, { useState } from 'react';
import { TranslationSet, UserRole } from '../types';
import Logo from './Logo';
import { ChevronLeftIcon } from './icons';

interface LoginScreenProps {
    onLogin: (id: string, role: UserRole) => void;
    onBack: () => void;
    t: TranslationSet;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack, t }) => {
    const [patientId, setPatientId] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Caretaker);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // Simple validation for demonstration
        if (patientId.trim().toUpperCase().startsWith('MEDIMATE-')) {
            onLogin(patientId.trim(), role);
        } else {
            setError(t.loginErrorInvalidId);
        }
    };

    const roleButtonClass = "w-full p-3 font-semibold rounded-lg transition text-sm";

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-black animate-gradient-pan">
            <button onClick={onBack} className="absolute top-4 left-4 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition">
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            <div className="w-full max-w-sm">
                <Logo 
                    className="h-16 mx-auto mb-6 animate-slide-in-up" 
                    style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
                />
                
                <div 
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg animate-slide-in-up" 
                    style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
                >
                    <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">{t.login}</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                id="patientId"
                                type="text"
                                value={patientId}
                                onChange={(e) => {
                                    setPatientId(e.target.value)
                                    if(error) setError('');
                                }}
                                className={`block px-3.5 pb-2.5 pt-4 w-full text-sm text-slate-900 bg-transparent rounded-lg border-1 appearance-none dark:text-white dark:focus:border-[#92D050] focus:outline-none focus:ring-0 focus:border-[#0C8346] peer ${error ? 'border-red-500' : 'border-red-500'}`}
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="patientId"
                                className={`absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white/0 dark:bg-gray-800/0 px-2 peer-focus:px-2 peer-focus:text-[#0C8346] peer-focus:dark:text-[#92D050] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1`}
                            >
                                {t.patientId}
                            </label>
                        </div>

                        {error && <p className="text-xs text-red-600 dark:text-red-400 -mt-3 text-center">{error}</p>}

                        <div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole(UserRole.Caretaker)}
                                    className={`${roleButtonClass} ${role === UserRole.Caretaker ? 'bg-[#0C8346] text-white shadow-md' : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-gray-600'}`}
                                >
                                    {t.roleCaretaker}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole(UserRole.Family)}
                                    className={`${roleButtonClass} ${role === UserRole.Family ? 'bg-[#0C8346] text-white shadow-md' : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-gray-600'}`}
                                >
                                    {t.roleFamily}
                                </button>
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="w-full p-3 font-semibold rounded-lg transition bg-[#0C8346] text-white hover:bg-green-800 shadow-lg hover:shadow-green-800/30">
                                {t.login}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;