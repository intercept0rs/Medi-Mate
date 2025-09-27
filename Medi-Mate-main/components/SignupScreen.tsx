import React, { useState } from 'react';
import { TranslationSet } from '../types';
import Logo from './Logo';
import { ChevronLeftIcon, CopyIcon } from './icons';

interface SignupScreenProps {
    onShowLogin: () => void;
    onBack: () => void;
    t: TranslationSet;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onShowLogin, onBack, t }) => {
    const [patientName, setPatientName] = useState('');
    const [patientId, setPatientId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateId = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientName.trim()) return;
        
        const sanitizedName = patientName.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        const newId = `MEDIMATE-${sanitizedName.slice(0, 8)}-${randomNumber}`;
        setPatientId(newId);
    };

    const handleCopy = () => {
        if (!patientId) return;
        navigator.clipboard.writeText(patientId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-black animate-gradient-pan relative">
             <button onClick={onBack} className="absolute top-4 left-4 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition">
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            <div className="w-full max-w-sm text-center">
                 <Logo 
                    className="h-16 mx-auto mb-6 animate-slide-in-up"
                    style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
                 />

                <div 
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg animate-slide-in-up"
                    style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
                >
                    {!patientId ? (
                         <form onSubmit={handleGenerateId} className="space-y-6">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.createProfile}</h1>
                             <div className="relative">
                                <input
                                    id="patientName"
                                    type="text"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    className="block px-3.5 pb-2.5 pt-4 w-full text-sm text-slate-900 bg-transparent rounded-lg border-1 border-slate-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-[#92D050] focus:outline-none focus:ring-0 focus:border-[#0C8346] peer"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="patientName"
                                    className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white/0 dark:bg-gray-800/0 px-2 peer-focus:px-2 peer-focus:text-[#0C8346] peer-focus:dark:text-[#92D050] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
                                >
                                    {t.patientNameLabel}
                                </label>
                            </div>
                            <button type="submit" className="w-full p-3 font-semibold rounded-lg transition bg-[#0C8346] text-white hover:bg-green-800 shadow-lg hover:shadow-green-800/30">
                                {t.generateId}
                            </button>
                        </form>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.yourPatientId}</h1>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">{t.sharePatientId}</p>
                            
                            <div className="relative bg-slate-100 dark:bg-gray-900/50 p-4 rounded-lg mb-4 border border-slate-200 dark:border-gray-700">
                                <p className="text-lg md:text-xl font-bold tracking-widest text-[#0C8346] dark:text-[#92D050] break-all">{patientId}</p>
                                <button onClick={handleCopy} title={t.copyId} className="absolute -top-3 -right-3 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-600 hover:scale-110 transition">
                                    <CopyIcon className="w-5 h-5"/>
                                </button>
                            </div>

                            <div className={`text-sm font-semibold transition-opacity duration-300 ${copied ? 'opacity-100 text-green-600 dark:text-green-400' : 'opacity-0'}`}>
                                {t.idCopied}
                            </div>

                            <button onClick={onShowLogin} className="w-full p-3 font-semibold rounded-lg transition bg-[#0C8346] text-white hover:bg-green-800 mt-4 shadow-lg hover:shadow-green-800/30">
                                {t.login}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignupScreen;