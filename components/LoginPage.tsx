
import React, { useState, useEffect } from 'react';
import { ShieldAlert, User as UserIcon, Building2, ArrowRight, Zap, Lock, Mail, Eye, EyeOff, ShieldCheck, RefreshCw, Smartphone, UserPlus, UserCheck, Hexagon } from 'lucide-react';
import { AppRole, Notification as NotificationType, User } from '../types';
import { Database } from '../services/database';

interface LoginPageProps {
  onLogin: (user: User) => void;
  addNotification: (notif: Omit<NotificationType, 'id' | 'timestamp'>) => void;
}

const REMEMBER_KEY = 'fixmycity_remembered_creds';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, addNotification }) => {
  const [role, setRole] = useState<AppRole>(AppRole.CITIZEN);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [correctOtp, setCorrectOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<'LOGIN' | 'SIGNUP' | 'VERIFY'>('LOGIN');
  const [timer, setTimer] = useState(30);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // Pre-fill remembered credentials on mount
  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_KEY);
    if (remembered) {
      try {
        const { email: savedEmail, password: savedPassword, role: savedRole } = JSON.parse(remembered);
        setEmail(savedEmail || '');
        setPassword(savedPassword || '');
        if (savedRole) setRole(savedRole);
      } catch (e) {
        localStorage.removeItem(REMEMBER_KEY);
      }
    }
  }, []);

  const rememberCredentials = (email: string, pass: string, role: AppRole) => {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password: pass, role }));
  };

  useEffect(() => {
    let interval: any;
    if (stage === 'VERIFY' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [stage, timer]);

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const guestUser: User = {
        id: 'guest_' + Math.floor(Math.random() * 1000),
        name: 'Guest Citizen',
        email: 'guest@solapur.in',
        role: AppRole.CITIZEN,
        reputation: 100,
        avatar: 'https://i.pravatar.cc/150?u=guest',
        followers: 0,
        following: 0
      };
      
      addNotification({
        title: 'Guest Access Granted',
        message: 'Welcome to FixMyCity! You are browsing in guest mode.',
        type: 'success'
      });
      
      onLogin(guestUser);
    }, 1500);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Required: Email and Password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const foundUser = Database.Users.validate(email, password);
      
      if (!foundUser) {
        setError('Invalid credentials. Account not found or password incorrect.');
        setIsLoading(false);
        return;
      }

      if (foundUser.role !== role) {
        setError(`Access Denied: This account is registered as ${foundUser.role}. Please switch roles.`);
        setIsLoading(false);
        return;
      }

      // Store credentials for next direct login
      rememberCredentials(email, password, role);

      setPendingUser(foundUser);
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setCorrectOtp(newCode);
      
      setTimeout(() => {
        addNotification({
          title: '📧 Identity Verification',
          message: `FixMyCity OTP for ${foundUser.name}: ${newCode}. Valid for 5 minutes.`,
          type: 'info'
        });
      }, 500);

      setStage('VERIFY');
      setIsLoading(false);
    }, 1000);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name) {
      setError('All fields are required for registration.');
      return;
    }

    if (Database.Users.findByEmail(email)) {
      setError('An account with this email already exists.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const prefix = role === AppRole.CITIZEN ? 'usr' : 'adm';
      const newUser: User = {
        id: `${prefix}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password,
        role: role,
        reputation: 0,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        followers: 0,
        following: 0
      };

      // Store credentials for next direct login
      rememberCredentials(email, password, role);

      setPendingUser(newUser);
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setCorrectOtp(newCode);
      
      setTimeout(() => {
        addNotification({
          title: role === AppRole.CITIZEN ? '📧 Welcome to Solapur' : '🏛 Municipal Onboarding',
          message: `Verification code for your new account: ${newCode}.`,
          type: 'info'
        });
      }, 500);

      setStage('VERIFY');
      setIsLoading(false);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const enteredOtp = otp.join('');
    
    setTimeout(() => {
      if (enteredOtp !== correctOtp && enteredOtp !== '123456') {
        setError('Verification failed. Code mismatch.');
        setIsLoading(false);
      } else if (pendingUser) {
        // Only save to DB if it's a new user (during signup stage)
        // If it's existing user login, we just proceed.
        if (stage === 'VERIFY' && !Database.Users.findByEmail(pendingUser.email)) {
          Database.Users.create(pendingUser);
        }
        onLogin(pendingUser);
      }
    }, 800);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCorrectOtp(newCode);
    
    addNotification({
      title: '📧 OTP Resent',
      message: `Your new security code is ${newCode}.`,
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-500/20 blur-[100px] rounded-full animate-blob mix-blend-screen" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full animate-blob mix-blend-screen" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 blur-[100px] rounded-full animate-blob mix-blend-screen" style={{ animationDelay: '4s' }} />

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-sky-400 to-indigo-600 rounded-[2rem] neon-border mb-6 shadow-[0_0_40px_rgba(14,165,233,0.5)] animate-float relative group">
            <Hexagon className="text-white fill-white/10 absolute group-hover:rotate-90 transition-transform duration-700" size={64} strokeWidth={1.5} />
            <Zap className="text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] absolute z-10" size={32} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 drop-shadow-lg">FixMyCity</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">
            {stage === 'LOGIN' ? 'Secure Access Portal' : stage === 'SIGNUP' ? 'Registration Portal' : 'Identity Verification'}
          </p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative min-h-[480px] flex flex-col backdrop-blur-xl bg-slate-900/40">
          {stage === 'LOGIN' || stage === 'SIGNUP' ? (
            <div className="animate-scale-in">
              <div className="flex p-1 bg-slate-950/60 rounded-2xl mb-8 border border-white/5 shadow-inner">
                <button
                  onClick={() => { setRole(AppRole.CITIZEN); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 text-sm font-bold ${
                    role === AppRole.CITIZEN ? 'bg-sky-500 text-white shadow-lg scale-100' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 scale-95'
                  }`}
                >
                  <UserIcon size={16} /> Citizen
                </button>
                <button
                  onClick={() => { setRole(AppRole.AUTHORITY); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 text-sm font-bold ${
                    role === AppRole.AUTHORITY ? 'bg-indigo-500 text-white shadow-lg scale-100' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 scale-95'
                  }`}
                >
                  <Building2 size={16} /> Municipal
                </button>
              </div>

              <form onSubmit={stage === 'LOGIN' ? handleInitialSubmit : handleSignUpSubmit} className="space-y-5">
                {stage === 'SIGNUP' && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <label className="block text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2 ml-1">
                      {role === AppRole.CITIZEN ? 'Full Name' : 'Officer Name / ID'}
                    </label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={role === AppRole.CITIZEN ? "Rahul Sharma" : "Asst. Commissioner Patil"}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all group-hover:bg-slate-900/80"
                      />
                    </div>
                  </div>
                )}

                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <label className="block text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2 ml-1">Identity Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === AppRole.CITIZEN ? "rahul@solapur.in" : "admin@solapur.gov"}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all group-hover:bg-slate-900/80"
                    />
                  </div>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <label className="block text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2 ml-1">Security Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all group-hover:bg-slate-900/80"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold text-center animate-shake backdrop-blur-sm">{error}</div>}

                <div className="flex gap-3 pt-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <button
                    disabled={isLoading}
                    type="submit"
                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 ${
                      role === AppRole.CITIZEN ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:to-sky-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:to-indigo-500'
                    } text-white shadow-lg shadow-sky-500/20 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <>{stage === 'LOGIN' ? 'Login' : 'Complete Registration'} <ArrowRight size={16} /></>}
                  </button>
                </div>

                <div className="relative flex py-2 items-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                   <div className="flex-grow border-t border-white/10"></div>
                   <span className="flex-shrink-0 mx-4 text-[10px] text-slate-500 uppercase tracking-widest">Or</span>
                   <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg"
                  >
                    <UserCheck size={18} />
                    Enter as Guest
                  </button>
                </div>

                <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                  <button 
                    type="button"
                    onClick={() => { setStage(stage === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(''); }}
                    className={`text-xs font-bold flex items-center justify-center gap-2 mx-auto transition-colors ${
                      role === AppRole.CITIZEN ? 'text-sky-400 hover:text-sky-300' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    {stage === 'LOGIN' ? (
                      <>
                        <UserPlus size={14} /> 
                        {role === AppRole.CITIZEN ? 'New Resident? Create ID' : 'New Official? Create ID'}
                      </>
                    ) : (
                      <>
                        <UserIcon size={14} /> 
                        {role === AppRole.CITIZEN ? 'Existing Resident? Login' : 'Existing Official? Login'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-scale-in flex flex-col h-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Check for Security Code</h3>
                <p className="text-sm text-slate-400 mb-4">
                  A verification code has been dispatched to {pendingUser?.name}.
                </p>
                <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 backdrop-blur-md">
                  <p className="text-xs text-sky-400 font-bold flex items-center justify-center gap-2">
                    <Smartphone size={14} /> Simulated OTP: Check top-right notification
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-8 flex-1 flex flex-col justify-between">
                <div className="flex justify-between gap-2 px-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-12 h-16 bg-slate-900/80 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all shadow-inner focus:scale-110"
                    />
                  ))}
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold text-center backdrop-blur-sm">{error}</div>}

                <div className="space-y-4">
                  <button
                    disabled={isLoading || otp.some(d => d === '')}
                    type="submit"
                    className={`w-full ${role === AppRole.CITIZEN ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:to-sky-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:to-indigo-500'} disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95`}
                  >
                    {isLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Verify Identity'}
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={timer > 0}
                      className={`text-xs font-bold uppercase tracking-widest ${timer > 0 ? 'text-slate-600' : (role === AppRole.CITIZEN ? 'text-sky-400 hover:text-sky-300' : 'text-indigo-400 hover:text-indigo-300')} transition-colors`}
                    >
                      {timer > 0 ? `Resend in ${timer}s` : 'Resend Verification Code'}
                    </button>
                  </div>
                </div>
              </form>
              
              <button 
                onClick={() => setStage('LOGIN')}
                className="mt-6 text-xs text-slate-500 hover:text-white transition-colors text-center"
              >
                Cancel & Return
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
           <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Enterprise Smart-City Authentication</p>
           <div className="flex gap-4 text-[10px] font-mono text-slate-500">
             <span>Simulation Key: 123456</span>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
