
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import Notification from './components/Notification';
import Settings from './components/Settings';
import { AppRole, Notification as NotificationType, User } from './types';
import { Language } from './translations';
import { Database } from './services/database';

const SESSION_KEY = 'fixmycity_active_session';
const THEME_KEY = 'fixmycity_theme';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [language, setLanguage] = useState<Language>('EN');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load session and theme on mount
  useEffect(() => {
    // Initialize Database (Seeds mock data if empty)
    Database.initialize();

    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setActiveView(user.role === AppRole.CITIZEN ? 'dashboard' : 'command');
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const addNotification = (notif: Omit<NotificationType, 'id' | 'timestamp'>) => {
    const newNotif: NotificationType = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Simulate Solapur City Alerts
  useEffect(() => {
    if (isLoggedIn) {
      const timers = [
        setTimeout(() => addNotification({
          title: '🚦 Traffic Alert: Saat Rasta',
          message: 'Heavy congestion detected near Saat Rasta Chowk due to ongoing metro work. Expected delay: 15 mins.',
          type: 'warning'
        }), 2500),
        setTimeout(() => addNotification({
          title: '💧 Water Supply Update',
          message: 'Scheduled maintenance for North Solapur sector completed ahead of time. Supply resuming at 4 PM.',
          type: 'info'
        }), 6000),
        setTimeout(() => addNotification({
          title: '🚧 Road Closure',
          message: 'VIP Road closed for resurfacing work. Please take the Hotgi Road bypass.',
          type: 'warning'
        }), 15000),
        setTimeout(() => addNotification({
          title: '🎉 Civic Festival',
          message: 'Gadda Yatra preparations have begun near Siddheshwar Temple. Traffic diverted.',
          type: 'info'
        }), 25000)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isLoggedIn]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setActiveView(user.role === AppRole.CITIZEN ? 'dashboard' : 'command');
    
    // Save session for direct login on next visit
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    addNotification({
      title: 'Session Established',
      message: `Successfully authenticated as ${user.name}. Session saved for direct access.`,
      type: 'success'
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    addNotification({
      title: 'Logged Out',
      message: 'Your secure session has been terminated.',
      type: 'info'
    });
  };

  const handleRoleSwitch = (newRole: AppRole) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: newRole };
    setCurrentUser(updatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    setActiveView(newRole === AppRole.CITIZEN ? 'dashboard' : 'command');
  };

  return (
    <div className={`min-h-screen text-slate-800 dark:text-slate-200 selection:bg-sky-500/30 font-sans transition-colors duration-500 ${language !== 'EN' ? 'leading-relaxed' : ''}`}>
      
      {/* Notifications Overlay */}
      <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-3">
          {notifications.map(n => (
            <Notification key={n.id} notification={n} onClose={removeNotification} />
          ))}
        </div>
      </div>

      {!isLoggedIn || !currentUser ? (
        <LoginPage onLogin={handleLogin} addNotification={addNotification} />
      ) : (
        <div className="flex relative z-10">
          <Sidebar 
            role={currentUser.role} 
            onRoleSwitch={handleRoleSwitch} 
            activeView={activeView} 
            onViewChange={setActiveView} 
            onLogout={handleLogout}
            language={language}
          />
          
          <main className="flex-1 ml-64 flex flex-col transition-all duration-500 min-h-screen">
            {activeView === 'settings' ? (
              <div className="p-8">
                <Settings 
                  language={language} 
                  onLanguageChange={setLanguage} 
                  theme={theme}
                  onThemeChange={setTheme}
                />
              </div>
            ) : (
              <Dashboard 
                role={currentUser.role}
                user={currentUser}
                activeView={activeView} 
                onViewChange={setActiveView} 
                language={language}
              />
            )}
          </main>
        </div>
      )}

      {/* Ambient Background Effects - Global */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 dark:bg-primary-600/10 blur-[130px] rounded-full pointer-events-none z-0 animate-blob" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-sky-500/10 dark:bg-accent-600/10 blur-[130px] rounded-full pointer-events-none z-0 animate-blob" style={{ animationDelay: '5s' }} />
      <div className="fixed top-[40%] left-[40%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/5 blur-[150px] rounded-full pointer-events-none z-0 animate-blob" style={{ animationDelay: '10s' }} />
    </div>
  );
};

export default App;
