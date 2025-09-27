import React from 'react';
import { AppView, Medicine, TranslationSet, UserRole } from '../types';
import { HomeIcon, PlusCircleIcon, ChatBubbleIcon, SparklesIcon, EmergencyIcon } from './icons';

interface BottomNavProps {
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    t: TranslationSet;
    medicines: Medicine[];
    userRole: UserRole;
    unreadMessagesCount: number;
    onEmergencyClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, t, medicines, userRole, unreadMessagesCount, onEmergencyClick }) => {
    const lowStockCount = medicines.filter(m => m.stock <= m.stockThreshold).length;

    const navItems = [
        { view: AppView.Home, label: t.navHome, icon: HomeIcon, notificationCount: lowStockCount, role: ['caretaker', 'family'] },
        { view: AppView.Add, label: t.navAdd, icon: PlusCircleIcon, role: ['caretaker'] },
        { view: AppView.Messages, label: t.navMessages, icon: ChatBubbleIcon, notificationCount: unreadMessagesCount, role: ['caretaker', 'family'] },
        { view: AppView.AI, label: t.navAI, icon: SparklesIcon, role: ['caretaker', 'family'] },
    ];
    
    const accessibleNavItems = navItems.filter(item => item.role.includes(userRole));

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md">
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-gray-700 flex justify-around items-center h-16 shadow-top">
                {accessibleNavItems.map(item => {
                    const isActive = currentView === item.view;
                    return (
                        <button 
                            key={item.view}
                            onClick={() => setCurrentView(item.view)} 
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${isActive ? 'text-[#0C8346] dark:text-[#92D050]' : 'text-slate-500 dark:text-slate-400 hover:text-[#0C8346] dark:hover:text-[#92D050]'}`}
                        >
                            <item.icon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">{item.label}</span>
                            {item.notificationCount && item.notificationCount > 0 && (
                                <span className="absolute top-1 right-4 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {item.notificationCount}
                                </span>
                            )}
                            {isActive && <div className="absolute bottom-0 h-1 w-8 bg-[#0C8346] dark:bg-[#92D050] rounded-full" />}
                        </button>
                    );
                })}
                <button
                    onClick={onEmergencyClick}
                    className="flex flex-col items-center justify-center w-full h-full text-white bg-gradient-to-br from-red-500 to-red-700"
                >
                    <EmergencyIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">{t.navEmergency}</span>
                </button>
            </nav>
        </div>
    );
};

export default BottomNav;