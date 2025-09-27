import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ReferenceLine } from 'recharts';
import { Medicine, Appointment, TranslationSet, UserRole, Theme, HealthLogEntry, Feeling } from '../types';
import { PencilIcon, CheckIcon, PlusIcon, MinusIcon, ChevronLeftIcon } from './icons';

interface DashboardProps {
    medicines: Medicine[];
    appointments: Appointment[];
    t: TranslationSet;
    userRole: UserRole;
    handleEditMedicine: (medicine: Medicine) => void;
    theme: Theme;
    takenMedicines: Record<string, string>;
    onToggleMedicineTaken: (medicineId: string) => void;
    hydrationData: Record<string, number>;
    onUpdateHydration: (change: 1 | -1) => void;
    healthLog: HealthLogEntry[];
    onAddHealthLog: (entry: { feeling: Feeling, note?: string, prompt: string }) => void;
}


const HealthCheckin: React.FC<{t: TranslationSet, onAddHealthLog: DashboardProps['onAddHealthLog'], healthLog: HealthLogEntry[], userRole: UserRole}> = ({ t, onAddHealthLog, healthLog, userRole }) => {
    const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
    const [note, setNote] = useState('');
    const [step, setStep] = useState(1); // 1: Select feeling, 2: Add note & confirm

    const getCheckinPrompt = (t: TranslationSet): string => {
        const hour = new Date().getHours();
        if (hour < 12) return t.feelingPromptMorning;
        if (hour < 17) return t.feelingPromptAfternoon;
        return t.feelingPromptEvening;
    };
    
    const prompt = getCheckinPrompt(t);
    const lastLogEntry = healthLog[0]; // Assumes log is sorted descending
    const hasLoggedRecently = lastLogEntry && (new Date().getTime() - new Date(lastLogEntry.timestamp).getTime()) < 3 * 60 * 60 * 1000; // 3 hours

    const feelingOptions: { feeling: Feeling, emoji: string, label: string }[] = [
        { feeling: Feeling.Good, emoji: '😊', label: t.feelingGood },
        { feeling: Feeling.Tired, emoji: '🥱', label: t.feelingTired },
        { feeling: Feeling.InPain, emoji: '🤕', label: t.feelingInPain },
        { feeling: Feeling.Energetic, emoji: '⚡️', label: t.feelingEnergetic },
    ];

    const handleSelectFeeling = (feeling: Feeling) => {
        setSelectedFeeling(feeling);
        setStep(2);
    };

    const handleGoBack = () => {
        setStep(1);
        // We keep selectedFeeling so the previous choice is highlighted
    };

    const handleSubmit = () => {
        if (selectedFeeling) {
            onAddHealthLog({ feeling: selectedFeeling, note: note.trim(), prompt });
            // Reset internal state after submission
            setSelectedFeeling(null);
            setNote('');
            setStep(1);
        }
    };

    if (userRole === UserRole.Family) {
      return null; // Don't show check-in for family members
    }
    
    if (hasLoggedRecently) {
        return (
             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
                <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-2">{t.todaysCheckIn}</h3>
                <p className="text-slate-600 dark:text-slate-300">{t.feelingLogged}</p>
            </div>
        )
    }

    const currentFeelingDetails = feelingOptions.find(f => f.feeling === selectedFeeling);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-3">{t.todaysCheckIn}</h3>
            <p className="text-slate-700 dark:text-slate-200 mb-4 text-sm">{prompt}</p>
            
            {step === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fade-in">
                    {feelingOptions.map(({ feeling, emoji, label }) => (
                         <button 
                            key={feeling} 
                            onClick={() => handleSelectFeeling(feeling)}
                            className={`p-2 rounded-lg border-2 transition text-sm font-semibold flex items-center justify-center gap-2
                                ${selectedFeeling === feeling 
                                    ? 'bg-[#0C8346] border-[#0C8346] text-white dark:bg-[#92D050] dark:border-[#92D050] dark:text-gray-900' 
                                    : 'bg-slate-100 border-slate-100 dark:bg-gray-700 dark:border-gray-700 text-slate-700 dark:text-slate-200 hover:border-[#0C8346] dark:hover:border-[#92D050]'
                                }`}
                        >
                            <span>{emoji}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}

            {step === 2 && currentFeelingDetails && (
                <div className="space-y-3 animate-fade-in">
                     <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                           You're feeling: {currentFeelingDetails.emoji} {currentFeelingDetails.label}
                        </p>
                        <button onClick={handleGoBack} className="text-sm font-semibold text-[#0C8346] dark:text-[#92D050] hover:underline">
                            Change
                        </button>
                    </div>
                     <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t.addANoteOptional}
                        className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0C8346]"
                        rows={2}
                    />
                    <button 
                        onClick={handleSubmit}
                        disabled={!selectedFeeling}
                        className="w-full p-3 font-semibold rounded-lg transition bg-[#0C8346] text-white hover:bg-green-800 shadow-sm disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {t.logFeeling}
                    </button>
                </div>
            )}
        </div>
    );
};

const getFeelingEmoji = (feeling: Feeling): string => {
    switch (feeling) {
        case Feeling.Good: return '😊';
        case Feeling.Tired: return '🥱';
        case Feeling.InPain: return '🤕';
        case Feeling.Energetic: return '⚡️';
        default: return '🤔';
    }
};

const Dashboard: React.FC<DashboardProps> = ({ medicines, appointments, t, userRole, handleEditMedicine, theme, takenMedicines, onToggleMedicineTaken, hydrationData, onUpdateHydration, healthLog, onAddHealthLog }) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    const upcomingMedicines = medicines
        .filter(med => !takenMedicines[med.id] || takenMedicines[med.id] !== todayStr)
        .map(med => {
            const [hours, minutes] = med.time.split(':').map(Number);
            return { ...med, totalMinutes: hours * 60 + minutes };
        })
        .filter(med => med.totalMinutes >= currentTime)
        .sort((a, b) => a.totalMinutes - b.totalMinutes);

    const nextMed = upcomingMedicines[0];
    const lowStockMeds = medicines.filter(med => med.stock <= med.stockThreshold);

    const todaysAppointments = appointments.filter(app => app.date === todayStr);

    const todaysLogEntries = healthLog.filter(entry => entry.timestamp.startsWith(todayStr));

    // Mock data for charts
    const adherenceData = [
        { name: 'Mon', completed: 80 }, { name: 'Tue', completed: 100 },
        { name: 'Wed', completed: 90 }, { name: 'Thu', completed: 100 },
        { name: 'Fri', completed: 70 }, { name: 'Sat', completed: 100 }, { name: 'Sun', completed: 100 },
    ];
    
    const hydrationGoal = 8;
    const todaysHydrationCount = hydrationData[todayStr] || 0;
    const isGoalReached = todaysHydrationCount >= hydrationGoal;

    const dynamicHydrationData = [
        { name: 'Drank', value: todaysHydrationCount },
        { name: 'Remaining', value: Math.max(0, hydrationGoal - todaysHydrationCount) }
    ];
    const HYDRATION_COLORS_LIGHT = ['#0C8346', '#E0E0E0'];
    const HYDRATION_COLORS_DARK = ['#92D050', '#4A5568'];
    const hydrationColors = theme === 'dark' ? HYDRATION_COLORS_DARK : HYDRATION_COLORS_LIGHT;

    return (
        <div className="space-y-4">
            {lowStockMeds.length > 0 && (
                <div className="p-4 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 rounded-lg shadow-sm">
                    <h3 className="font-bold text-red-800 dark:text-red-200">{t.stockAlert}</h3>
                    <ul className="mt-2 text-sm text-red-700 dark:text-red-300">
                        {lowStockMeds.map(med => (
                            <li key={med.id}>- {med.name} ({t.lowStock} {med.stock} {t.unitsLeft})</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-3">{t.nextMedication}</h3>
                {nextMed ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{nextMed.name}</p>
                            <p className="text-slate-600 dark:text-slate-300">{nextMed.dosage}</p>
                        </div>
                        <p className="text-2xl font-bold text-[#0C8346] dark:text-[#92D050]">{nextMed.time}</p>
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">{t.noUpcomingMedication}</p>
                )}
            </div>
            
            <HealthCheckin t={t} onAddHealthLog={onAddHealthLog} healthLog={healthLog} userRole={userRole}/>
            
            {todaysLogEntries.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-4">{t.dailyHealthLog}</h3>
                    <div className="space-y-4 border-l-2 border-slate-200 dark:border-gray-600 ml-2">
                        {todaysLogEntries.map(entry => (
                            <div key={entry.id} className="relative pl-6">
                                <div className="absolute -left-[7px] top-1.5 w-3 h-3 bg-slate-300 dark:bg-gray-500 rounded-full"></div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                    {getFeelingEmoji(entry.feeling)} {entry.feeling}
                                </p>
                                {entry.note && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 italic">"{entry.note}"</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-3">{t.todaysAppointments}</h3>
                {todaysAppointments.length > 0 ? (
                    <ul className="space-y-3">
                        {todaysAppointments.map(app => (
                            <li key={app.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{app.doctor}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{app.clinic}</p>
                                </div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">{app.time}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">{t.noAppointmentsToday}</p>
                )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-4">{t.allMedications}</h3>
                 <ul className="space-y-3">
                    {medicines.map(med => {
                        const isTaken = takenMedicines[med.id] === todayStr;
                        return (
                        <li key={med.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {userRole === 'caretaker' ? (
                                    <button
                                        onClick={() => onToggleMedicineTaken(med.id)}
                                        className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${isTaken ? 'bg-[#0C8346] border-[#0C8346] dark:bg-[#92D050] dark:border-[#92D050]' : 'border-slate-300 dark:border-gray-500 hover:border-[#0C8346]'}`}
                                        aria-label={`Mark ${med.name} as ${isTaken ? 'not taken' : 'taken'}`}
                                    >
                                        {isTaken && <CheckIcon className="w-4 h-4 text-white" />}
                                    </button>
                                ) : (
                                    <div className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isTaken ? 'bg-[#0C8346] border-[#0C8346] dark:bg-[#92D050] dark:border-[#92D050]' : 'border-slate-300 dark:border-gray-500'}`}>
                                        {isTaken && <CheckIcon className="w-4 h-4 text-white" />}
                                    </div>
                                )}
                                <div>
                                    <p className={`font-bold transition-colors ${isTaken ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>{med.name}</p>
                                    <p className={`text-sm transition-colors ${isTaken ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{t.stock}: {med.stock}</p>
                                </div>
                            </div>
                            {userRole === 'caretaker' && (
                                <button onClick={() => handleEditMedicine(med)} className="p-2 text-slate-500 hover:text-[#0C8346] dark:hover:text-[#92D050] rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition">
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                            )}
                        </li>
                    )})}
                 </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-4">{t.weeklyAdherence}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={adherenceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                            <YAxis tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', border: '1px solid #4A5568' }} />
                            <Bar dataKey="completed" fill={theme === 'dark' ? '#92D050' : '#0C8346'} name={t.completed} radius={[4, 4, 0, 0]} />
                             <ReferenceLine y={100} label={{ value: t.goal, position: 'insideTopRight', fill: theme === 'dark' ? '#CBD5E0' : '#718096' }} strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#A0AEC0'} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[#0C8346] dark:text-[#92D050] mb-4">{t.hydrationStatus}</h3>
                    <div className="flex items-center justify-center gap-4">
                        {userRole === UserRole.Caretaker && (
                            <button
                                onClick={() => onUpdateHydration(-1)}
                                aria-label={t.removeGlass}
                                disabled={todaysHydrationCount === 0}
                                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition hover:bg-slate-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MinusIcon className="w-6 h-6" />
                            </button>
                        )}
                        <div className="relative w-40 h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                     <Pie data={dynamicHydrationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={55} startAngle={90} endAngle={-270}>
                                        {dynamicHydrationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={hydrationColors[index % hydrationColors.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className={`text-3xl font-bold ${isGoalReached ? 'text-green-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                    {todaysHydrationCount}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">/ {hydrationGoal} {t.glasses}</span>
                                {isGoalReached && <span className="text-xs font-semibold text-green-500 mt-1 animate-fade-in">{t.goalReached}</span>}
                            </div>
                        </div>
                         {userRole === UserRole.Caretaker && (
                            <button
                                onClick={() => onUpdateHydration(1)}
                                aria-label={t.addGlass}
                                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition hover:bg-slate-200 dark:hover:bg-gray-600"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;