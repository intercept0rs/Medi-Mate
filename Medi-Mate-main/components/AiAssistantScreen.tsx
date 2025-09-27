import React, { useState } from 'react';
import { TranslationSet } from '../types';
import { fetchMedicineInfo, analyzeHealthReadings } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface AiAssistantScreenProps {
    t: TranslationSet;
}

const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({ t }) => {
    // Medicine state
    const [medicineName, setMedicineName] = useState('');
    const [info, setInfo] = useState('');
    const [isMedLoading, setIsMedLoading] = useState(false);
    const [medError, setMedError] = useState('');
    
    // Health Readings state
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [bloodSugar, setBloodSugar] = useState('');
    const [sugarReadingType, setSugarReadingType] = useState<'fasting' | 'afterMeal'>('fasting');
    const [analysis, setAnalysis] = useState('');
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState('');

    const handleFetchInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medicineName.trim()) return;
        setIsMedLoading(true);
        setInfo('');
        setMedError('');
        try {
            const result = await fetchMedicineInfo(medicineName, t);
            setInfo(result);
        } catch (err) {
            console.error(err);
            setMedError('Failed to fetch information. Please try again.');
            setInfo('');
        } finally {
            setIsMedLoading(false);
        }
    };

    const handleAnalyzeReadings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!systolic || !diastolic || !bloodSugar) return;
        setIsAnalysisLoading(true);
        setAnalysis('');
        setAnalysisError('');
        try {
            const result = await analyzeHealthReadings({
                systolic,
                diastolic,
                bloodSugar,
                sugarReadingType,
            }, t);
            setAnalysis(result);
        } catch (err) {
            console.error(err);
            setAnalysisError('Failed to analyze readings. Please try again.');
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const inputBaseClass = "w-full p-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0C8346] bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100";
    const labelBaseClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className="p-2 animate-fade-in space-y-8">
             {/* Medicine Section */}
            <div>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0C8346] dark:text-[#92D050]">{t.aiAssistant}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.askAboutMed}</p>
                </div>
            
                <form onSubmit={handleFetchInfo} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        placeholder={t.medicineName}
                        className="flex-grow p-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0C8346] bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
                        aria-label={t.medicineName}
                    />
                    <button 
                        type="submit"
                        disabled={isMedLoading || !medicineName.trim()} 
                        className="px-4 py-2 bg-[#0C8346] text-white font-semibold rounded-lg shadow-sm hover:bg-green-800 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isMedLoading ? t.loading : t.getInfo}
                    </button>
                </form>

                {isMedLoading && (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                        <p>{t.loading}</p>
                    </div>
                )}

                {medError && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                        {medError}
                    </div>
                )}

                {info && (
                    <div className="p-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg mt-4 border border-slate-200 dark:border-gray-700 animate-fade-in">
                        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-[#0C8346] dark:text-[#92D050]"/> {medicineName}</h3>
                        <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{info}</pre>
                    </div>
                )}

                <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center">{t.aiDisclaimer}</p>
            </div>

            <div className="border-t border-slate-200 dark:border-gray-700 my-4"></div>

            {/* Health Analysis Section */}
            <div>
                <div className="text-center mb-6">
                     <h2 className="text-2xl font-bold text-[#0C8346] dark:text-[#92D050]">{t.healthReadingAnalysis}</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.analyzeYourReadings}</p>
                </div>
                
                <form onSubmit={handleAnalyzeReadings} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="systolic" className={labelBaseClass}>{t.bloodPressureSys}</label>
                            <input id="systolic" type="number" value={systolic} onChange={e => setSystolic(e.target.value)} className={inputBaseClass} required />
                        </div>
                        <div>
                            <label htmlFor="diastolic" className={labelBaseClass}>{t.bloodPressureDia}</label>
                            <input id="diastolic" type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} className={inputBaseClass} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bloodSugar" className={labelBaseClass}>{t.bloodSugar}</label>
                            <input id="bloodSugar" type="number" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} className={inputBaseClass} required />
                        </div>
                         <div>
                            <label htmlFor="sugarReadingType" className={labelBaseClass}>{t.readingTime}</label>
                            <select id="sugarReadingType" value={sugarReadingType} onChange={e => setSugarReadingType(e.target.value as any)} className={`${inputBaseClass} pr-8`}>
                                <option value="fasting">{t.fasting}</option>
                                <option value="afterMeal">{t.afterMeal}</option>
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isAnalysisLoading || !systolic || !diastolic || !bloodSugar}
                        className="w-full px-4 py-3 bg-[#0C8346] text-white font-semibold rounded-lg shadow-sm hover:bg-green-800 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAnalysisLoading ? t.loading : t.analyzeReadings}
                    </button>
                </form>

                {isAnalysisLoading && ( <div className="text-center p-8 text-slate-500 dark:text-slate-400"><p>{t.loading}</p></div> )}
                {analysisError && ( <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg mt-4">{analysisError}</div> )}
                {analysis && (
                    <div className="p-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg mt-4 border border-slate-200 dark:border-gray-700 animate-fade-in">
                         <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-[#0C8346] dark:text-[#92D050]"/> Analysis</h3>
                        <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{analysis}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiAssistantScreen;