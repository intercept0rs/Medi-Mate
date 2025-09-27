import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AppView, UserRole, Language, Medicine, Appointment, Message, TranslationSet, Theme, NotificationSettings, HealthLogEntry, Feeling } from './types';
import { translations } from './lib/i18n';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddEditScreen from './components/AddEditScreen';
import MessagingScreen from './components/MessagingScreen';
import AiAssistantScreen from './components/AiAssistantScreen';
import ProfileScreen from './components/ProfileScreen';
import BottomNav from './components/BottomNav';
import { EmergencyModal } from './components/EmergencyButton';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import WelcomeScreen from './components/WelcomeScreen';
import { scheduleNotifications } from './services/notificationService';

// Mock data (used as a fallback for a new patient profile)
const initialMedicines: Medicine[] = [
  { id: '1', name: 'Metformin', dosage: '1 tablet', time: '08:00', stock: 20, stockThreshold: 10 },
  { id: '2', name: 'Amlodipine', dosage: '1 tablet', time: '08:00', stock: 50, stockThreshold: 15 },
  { id: '3', name: 'Atorvastatin', dosage: '1 tablet', time: '20:00', stock: 8, stockThreshold: 10 },
  { id: '4', name: 'Vitamin D', dosage: '1 capsule', time: '13:00', stock: 60, stockThreshold: 20 },
];

const initialAppointments: Appointment[] = [
  { id: '1', doctor: 'Dr. Smith', clinic: 'Cardiology Clinic', date: new Date().toISOString().split('T')[0], time: '11:30' },
];

const initialMessages: Message[] = [
    { id: '1', text: 'Hi! Just checking in. How is mom doing today?', sender: 'family', timestamp: '10:05 AM', read: true },
    { id: '2', text: 'She is doing well. Had a good breakfast and took her morning meds on time.', sender: 'caretaker', timestamp: '10:07 AM', read: true },
    { id: '3', text: 'That\'s great to hear! Thanks for the update.', sender: 'family', timestamp: '10:08 AM', read: false },
];

const defaultNotificationSettings: NotificationSettings = {
    medicineSound: 'default',
    medicineVibration: 'default',
    appointmentSound: 'default',
    appointmentVibration: 'default',
    appointmentInterval: 30,
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authScreen, setAuthScreen] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [patientId, setPatientId] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>(Language.English);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Caretaker);
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  const [previousView, setPreviousView] = useState<AppView>(AppView.Home);
  
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [takenMedicines, setTakenMedicines] = useState<Record<string, string>>({}); // { [medId]: 'YYYY-MM-DD' }
  const [hydrationData, setHydrationData] = useState<Record<string, number>>({}); // { 'YYYY-MM-DD': count }
  const [healthLog, setHealthLog] = useState<HealthLogEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const typingIndicatorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t: TranslationSet = useMemo(() => translations[language], [language]);

  const unreadMessagesCount = useMemo(() => {
    const sender = userRole === UserRole.Caretaker ? 'caretaker' : 'family';
    return messages.filter(msg => msg.sender !== sender && !msg.read).length;
  }, [messages, userRole]);

  const handleSetCurrentView = useCallback((view: AppView) => {
    if (view !== currentView) {
        if (view === AppView.Profile) {
            setPreviousView(currentView);
        }
        setCurrentView(view);
    }
  }, [currentView]);

  const handleBackFromProfile = useCallback(() => {
    setCurrentView(previousView);
  }, [previousView]);

  // Persist theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist data scoped to patientId
  useEffect(() => {
    if (patientId) localStorage.setItem(`notificationSettings_${patientId}`, JSON.stringify(notificationSettings));
  }, [notificationSettings, patientId]);

  useEffect(() => {
    if (patientId) localStorage.setItem(`medicines_${patientId}`, JSON.stringify(medicines));
  }, [medicines, patientId]);

  useEffect(() => {
    if (patientId) localStorage.setItem(`takenMedicines_${patientId}`, JSON.stringify(takenMedicines));
  }, [takenMedicines, patientId]);
  
  useEffect(() => {
    if (patientId) localStorage.setItem(`hydrationData_${patientId}`, JSON.stringify(hydrationData));
  }, [hydrationData, patientId]);

  useEffect(() => {
    if (patientId) localStorage.setItem(`healthLog_${patientId}`, JSON.stringify(healthLog));
  }, [healthLog, patientId]);
  
  useEffect(() => {
    if (patientId) localStorage.setItem(`appointments_${patientId}`, JSON.stringify(appointments));
  }, [appointments, patientId]);

  useEffect(() => {
    if (patientId) localStorage.setItem(`messages_${patientId}`, JSON.stringify(messages));
  }, [messages, patientId]);


  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);
  
  // Schedule notifications using the dedicated service
  useEffect(() => {
    const cleanup = scheduleNotifications(medicines, appointments, notificationSettings, t);
    return cleanup;
  }, [medicines, appointments, notificationSettings, t]);
  
  useEffect(() => {
    if (currentView !== AppView.Messages) {
      return;
    }
    
    const sender = userRole === UserRole.Caretaker ? 'caretaker' : 'family';
    const hasUnread = messages.some(msg => msg.sender !== sender && !msg.read);

    if (hasUnread) {
      const markAsReadTimer = setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.sender !== sender && !msg.read ? { ...msg, read: true } : msg
          )
        );
      }, 800);

      return () => clearTimeout(markAsReadTimer);
    }
  }, [currentView, userRole, messages]);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleAuthSuccess = useCallback((id: string, role: UserRole) => {
    const loadState = <T,>(key: string, defaultValue: T): T => {
        try {
            const storedValue = localStorage.getItem(`${key}_${id}`);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(`Error loading state for "${key}" from localStorage:`, error);
            return defaultValue;
        }
    };

    setPatientId(id);
    setUserRole(role);
    setMedicines(loadState('medicines', initialMedicines));
    setTakenMedicines(loadState('takenMedicines', {}));
    setHydrationData(loadState('hydrationData', {}));
    setHealthLog(loadState('healthLog', []));
    setAppointments(loadState('appointments', initialAppointments));
    setMessages(loadState('messages', initialMessages));
    setNotificationSettings(loadState('notificationSettings', defaultNotificationSettings));
    setIsAuthenticated(true);
    setCurrentView(AppView.Home);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setPatientId(null);
    setAuthScreen('welcome');
    setCurrentView(AppView.Home);
    // Clear data to prevent flashing old content on next login
    setMedicines([]);
    setTakenMedicines({});
    setHydrationData({});
    setHealthLog([]);
    setAppointments([]);
    setMessages([]);
    setNotificationSettings(defaultNotificationSettings);
  }, []);

  const handleToggleMedicineTaken = useCallback((medicineId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setTakenMedicines(prev => {
        const newTaken = { ...prev };
        if (newTaken[medicineId] === todayStr) {
            delete newTaken[medicineId]; // Untake it
        } else {
            newTaken[medicineId] = todayStr; // Take it
        }
        return newTaken;
    });
  }, []);

  const handleUpdateHydration = useCallback((change: 1 | -1) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setHydrationData(prev => {
        const currentCount = prev[todayStr] || 0;
        const newCount = Math.max(0, currentCount + change);
        
        const newHydrationData = { ...prev };
        newHydrationData[todayStr] = newCount;
        return newHydrationData;
    });
  }, []);

  const handleAddHealthLog = useCallback((entry: { feeling: Feeling, note?: string, prompt: string }) => {
    const newEntry: HealthLogEntry = {
        ...entry,
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
    };
    setHealthLog(prev => [...prev, newEntry].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const addMedicine = useCallback((med: Omit<Medicine, 'id'>) => {
    const newMedicine = { ...med, id: new Date().toISOString() };
    setMedicines(prev => [...prev, newMedicine]);
    setCurrentView(AppView.Home);
  }, []);

  const updateMedicine = useCallback((updatedMed: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === updatedMed.id ? updatedMed : m));
    setEditingMedicine(null);
    setCurrentView(AppView.Home);
  }, []);
  
  const handleEditMedicine = useCallback((medicine: Medicine) => {
    setEditingMedicine(medicine);
    setCurrentView(AppView.Add);
  }, []);
  
  const cancelEdit = useCallback(() => {
    setEditingMedicine(null);
    setCurrentView(AppView.Home);
  }, []);

  const addAppointment = useCallback((app: Omit<Appointment, 'id'>) => {
    const newAppointment = { ...app, id: new Date().toISOString() };
    setAppointments(prev => [...prev, newAppointment]);
    setCurrentView(AppView.Home);
  }, []);

  const addMessage = useCallback((text: string) => {
    if (typingIndicatorTimeout.current) clearTimeout(typingIndicatorTimeout.current);
    
    const sender = userRole === UserRole.Caretaker ? 'caretaker' : 'family';
    const newMessage: Message = {
        id: new Date().toISOString(),
        text,
        sender,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false, // The other party has not read it yet.
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, read: true } : m));
    }, 1500);

    setIsOtherUserTyping(true);
    typingIndicatorTimeout.current = setTimeout(() => setIsOtherUserTyping(false), 3500);
  }, [userRole]);

  useEffect(() => {
      return () => {
          if (typingIndicatorTimeout.current) clearTimeout(typingIndicatorTimeout.current);
      }
  }, []);


  const renderContent = () => {
    switch (currentView) {
      case AppView.Home:
        return <Dashboard 
          medicines={medicines} 
          appointments={appointments} 
          t={t} 
          userRole={userRole} 
          handleEditMedicine={handleEditMedicine} 
          theme={theme} 
          takenMedicines={takenMedicines} 
          onToggleMedicineTaken={handleToggleMedicineTaken} 
          hydrationData={hydrationData} 
          onUpdateHydration={handleUpdateHydration}
          healthLog={healthLog}
          onAddHealthLog={handleAddHealthLog}
        />;
      case AppView.Add:
        return <AddEditScreen addMedicine={addMedicine} addAppointment={addAppointment} t={t} editingMedicine={editingMedicine} updateMedicine={updateMedicine} cancelEdit={cancelEdit} />;
      case AppView.Messages:
        return <MessagingScreen messages={messages} addMessage={addMessage} t={t} userRole={userRole} isOtherUserTyping={isOtherUserTyping} />;
      case AppView.AI:
        return <AiAssistantScreen t={t} />;
      case AppView.Profile:
        return <ProfileScreen 
                    settings={notificationSettings} 
                    setSettings={setNotificationSettings} 
                    t={t} 
                    handleLogout={handleLogout}
                    healthLog={healthLog}
                    medicines={medicines}
                    takenMedicines={takenMedicines}
                    hydrationData={hydrationData}
                />;
      default:
        return <Dashboard 
          medicines={medicines} 
          appointments={appointments} 
          t={t} 
          userRole={userRole} 
          handleEditMedicine={handleEditMedicine} 
          theme={theme} 
          takenMedicines={takenMedicines} 
          onToggleMedicineTaken={handleToggleMedicineTaken} 
          hydrationData={hydrationData} 
          onUpdateHydration={handleUpdateHydration}
          healthLog={healthLog}
          onAddHealthLog={handleAddHealthLog}
        />;
    }
  };

  if (!isAuthenticated) {
    switch (authScreen) {
        case 'login':
            return <LoginScreen onLogin={handleAuthSuccess} onBack={() => setAuthScreen('welcome')} t={t} />;
        case 'signup':
            return <SignupScreen onShowLogin={() => setAuthScreen('login')} onBack={() => setAuthScreen('welcome')} t={t} />;
        case 'welcome':
        default:
            return <WelcomeScreen onShowLogin={() => setAuthScreen('login')} onShowSignup={() => setAuthScreen('signup')} t={t} />;
    }
  }

  return (
    <div className="bg-slate-100 dark:bg-gray-950 min-h-screen font-sans flex flex-col items-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 flex flex-col min-h-screen shadow-lg">
        <Header 
          language={language} 
          setLanguage={setLanguage} 
          userRole={userRole} 
          t={t} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          currentView={currentView}
          setCurrentView={handleSetCurrentView}
          handleBack={handleBackFromProfile}
        />
        <main className={`flex-grow p-4 ${currentView === AppView.Messages ? 'overflow-y-hidden' : 'overflow-y-auto'} pb-24`}>
          {renderContent()}
        </main>
        <EmergencyModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} t={t} />
        <BottomNav 
            currentView={currentView} 
            setCurrentView={handleSetCurrentView} 
            t={t} 
            medicines={medicines} 
            userRole={userRole} 
            unreadMessagesCount={unreadMessagesCount} 
            onEmergencyClick={() => setIsEmergencyModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default App;