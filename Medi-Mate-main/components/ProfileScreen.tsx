import React, { useState, useEffect, useRef } from 'react';
import { TranslationSet, NotificationSettings, HealthLogEntry, Medicine } from '../types';
import { ChevronDownIcon, LogoutIcon } from './icons';

interface ProfileScreenProps {
    settings: NotificationSettings;
    setSettings: React.Dispatch<React.SetStateAction<NotificationSettings>>;
    t: TranslationSet;
    handleLogout: () => void;
    healthLog: HealthLogEntry[];
    medicines: Medicine[];
    takenMedicines: Record<string, string>;
    hydrationData: Record<string, number>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ settings, setSettings, t, handleLogout, healthLog, medicines, takenMedicines, hydrationData }) => {
    const [showSaved, setShowSaved] = useState(false);
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSettingChange = (key: keyof NotificationSettings, value: string | number) => {
        setSettings(prev => ({
            ...prev,
            [key]: typeof prev[key] === 'number' ? Number(value) : value,
        }));
        
        setShowSaved(true);
        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }
        saveTimeout.current = setTimeout(() => setShowSaved(false), 2500);
    };

    useEffect(() => {
        // Cleanup timeout on unmount to prevent memory leaks
        return () => {
            if (saveTimeout.current) {
                clearTimeout(saveTimeout.current);
            }
        };
    }, []);

    const handleExportData = () => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
        const headers = ['Date', 'Time', 'Type', 'Details', 'Notes'];
        const rows: (string | number)[][] = [];
    
        // Health Log
        healthLog.filter(e => new Date(e.timestamp) >= oneMonthAgo).forEach(entry => {
            const d = new Date(entry.timestamp);
            rows.push([
                d.toLocaleDateString(),
                d.toLocaleTimeString(),
                'Health Check-in',
                entry.feeling,
                entry.note || ''
            ]);
        });
    
        // Meds Taken
        Object.entries(takenMedicines).forEach(([medId, dateStr]) => {
            const takenDate = new Date(dateStr + 'T00:00:00'); // Ensure it's treated as a full day
            if (takenDate >= oneMonthAgo) {
                const med = medicines.find(m => m.id === medId);
                if (med) {
                     rows.push([
                        takenDate.toLocaleDateString(),
                        med.time,
                        'Medication Taken',
                        med.name,
                        `Dosage: ${med.dosage}`
                     ]);
                }
            }
        });
    
        // Hydration
        Object.entries(hydrationData).forEach(([dateStr, count]) => {
             const hydrationDate = new Date(dateStr + 'T00:00:00');
            if (hydrationDate >= oneMonthAgo) {
                rows.push([
                    hydrationDate.toLocaleDateString(),
                    '', // Hydration has no specific time
                    'Hydration',
                    `${count} glasses`,
                    `Daily Total`
                ]);
            }
        });
    
        // Sort by date and then time
        rows.sort((a, b) => {
            const dateA = new Date(`${a[0]} ${a[1] || '00:00:00'}`).getTime();
            const dateB = new Date(`${b[0]} ${b[1] || '00:00:00'}`).getTime();
            return dateA - dateB;
        });
    
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const today = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `MediMate_Export_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectBaseClass = "w-full p-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 appearance-none";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
    const sectionClass = "space-y-4 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-slate-200 dark:border-gray-700";

    return (
        <div className="p-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.profileTitle}</h2>
            
            {/* Data Export Section */}
             <div className={sectionClass}>
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t.dataExport}</h3>
                 <button 
                    onClick={handleExportData}
                    className="w-full text-center p-3 font-semibold rounded-lg transition bg-[#0C8346] text-white hover:bg-green-800 shadow-sm"
                 >
                    {t.exportLastMonth}
                </button>
            </div>

            {/* Notification Settings Section */}
            <div className={sectionClass}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t.settingsTitle}</h3>
                
                {/* Medicine Reminder Settings */}
                <div className="space-y-4 pt-2">
                    <h4 className="font-semibold text-sky-800 dark:text-sky-300">{t.medicineReminders}</h4>
                    <div>
                        <label htmlFor="med-sound" className={labelClass}>{t.sound}</label>
                         <div className="relative">
                            <select 
                                id="med-sound" 
                                value={settings.medicineSound}
                                onChange={e => handleSettingChange('medicineSound', e.target.value)}
                                className={selectBaseClass}
                            >
                                <option value="default">{t.soundDefault}</option>
                                <option value="chime">{t.soundChime}</option>
                                <option value="alert">{t.soundAlert}</option>
                            </select>
                            <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="med-vibration" className={labelClass}>{t.vibration}</label>
                         <div className="relative">
                            <select 
                                id="med-vibration" 
                                value={settings.medicineVibration}
                                onChange={e => handleSettingChange('medicineVibration', e.target.value)}
                                className={selectBaseClass}
                            >
                                <option value="default">{t.vibrationDefault}</option>
                                <option value="pulse">{t.vibrationPulse}</option>
                                <option value="none">{t.vibrationNone}</option>
                            </select>
                             <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Appointment Reminder Settings */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                    <h4 className="font-semibold text-teal-800 dark:text-teal-300">{t.appointmentReminders}</h4>
                    <div>
                        <label htmlFor="app-sound" className={labelClass}>{t.sound}</label>
                        <div className="relative">
                            <select 
                                id="app-sound" 
                                value={settings.appointmentSound}
                                onChange={e => handleSettingChange('appointmentSound', e.target.value)}
                                className={selectBaseClass}
                            >
                                <option value="default">{t.soundDefault}</option>
                                <option value="chime">{t.soundChime}</option>
                                <option value="alert">{t.soundAlert}</option>
                            </select>
                            <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="app-vibration" className={labelClass}>{t.vibration}</label>
                        <div className="relative">
                            <select 
                                id="app-vibration" 
                                value={settings.appointmentVibration}
                                onChange={e => handleSettingChange('appointmentVibration', e.target.value)}
                                className={selectBaseClass}
                            >
                                <option value="default">{t.vibrationDefault}</option>
                                <option value="pulse">{t.vibrationPulse}</option>
                                <option value="none">{t.vibrationNone}</option>
                            </select>
                            <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="app-interval" className={labelClass}>{t.reminderInterval}</label>
                        <div className="relative">
                            <select 
                                id="app-interval" 
                                value={settings.appointmentInterval}
                                onChange={e => handleSettingChange('appointmentInterval', e.target.value)}
                                className={selectBaseClass}
                            >
                                <option value="15">{t.interval15}</option>
                                <option value="30">{t.interval30}</option>
                                <option value="60">{t.interval60}</option>
                            </select>
                            <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

             {/* Logout Button */}
            <div className="pt-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 font-semibold rounded-lg transition bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                >
                    <LogoutIcon className="w-5 h-5" />
                    <span>{t.logout}</span>
                </button>
            </div>

            {showSaved && (
                <div 
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2 rounded-full shadow-xl text-sm font-semibold animate-fade-in-out"
                    style={{ zIndex: 100 }}
                >
                    {t.settingsSaved}
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;