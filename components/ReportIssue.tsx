
import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload, X, ShieldAlert, CheckCircle, Zap, Loader2, Building2 } from 'lucide-react';
import { analyzeRoadDamage } from '../services/geminiService';
import { IssueCategory, Location, User } from '../types';

interface ReportIssueProps {
  user: User;
  onSuccess: (issue: any) => void;
  onCancel: () => void;
}

const ReportIssue: React.FC<ReportIssueProps> = ({ user, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [category, setCategory] = useState<IssueCategory>(IssueCategory.ROAD);
  const [department, setDepartment] = useState('ROAD_MAINTENANCE');
  const [location, setLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = [
    { id: 'ROAD_MAINTENANCE', label: 'Roads & Public Works' },
    { id: 'WASTE_MGMT', label: 'Waste Management' },
    { id: 'WATER_DEPT', label: 'Water Supply & Sewers' },
    { id: 'ELECTRICAL', label: 'Electrical & Streetlights' },
    { id: 'HEALTH_DEPT', label: 'Public Health' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setAnalyzing(true);
      const res = await analyzeRoadDamage(base64);
      if (res) {
        setAnalysis(res);
        setTitle(res.type);
        setDescription(res.description);
      }
      setAnalyzing(false);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  const detectLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Sector 4, Solapur North'
        });
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
        setLocation({ lat: 17.6599, lng: 75.9064, address: 'Solapur City Center' });
      }
    );
  };

  const handleSubmit = () => {
    onSuccess({
      id: `iss_${Date.now()}`,
      reporterId: user.id,
      reporterName: user.name,
      reporterAvatar: user.avatar,
      category,
      department,
      title: title || 'New City Issue',
      description,
      location: location || { lat: 17.6599, lng: 75.9064, address: 'Pending Verification' },
      imageUrl: image,
      status: 'OPEN',
      timestamp: new Date(),
      upvotes: 0,
      comments: 0,
      priority: analysis?.priority || 50,
      severity: analysis?.severity || 5
    });
  };

  return (
    <div className="glass max-w-2xl mx-auto rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in duration-300">
      <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Post to City Feed</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visual reports directly alert the authorities</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors">
          <X className="text-slate-500" />
        </button>
      </div>

      <div className="p-8">
        {step === 1 ? (
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer aspect-square max-w-sm mx-auto border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-sky-500/50 rounded-3xl flex flex-col items-center justify-center transition-all bg-slate-50 dark:bg-slate-900/20 hover:bg-sky-500/5"
            >
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 group-hover:bg-sky-500/20 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <Camera size={32} className="text-slate-500 group-hover:text-sky-400" />
              </div>
              <p className="text-slate-700 dark:text-white font-bold mb-1">Capture Issue</p>
              <p className="text-slate-500 text-sm">Smart AI auto-detects damage</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.values(IssueCategory).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-2xl border transition-all text-left ${category === cat ? 'bg-sky-500/10 border-sky-500 text-sky-500 dark:text-sky-400' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-500'}`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest">{cat}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl">
              <img src={image!} className="w-full h-full object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-sky-400 mb-4" size={40} />
                  <p className="text-sky-400 font-bold animate-pulse">Running Neural Analysis...</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Responsible Department</label>
                <div className="relative">
                   <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                   <select 
                     value={department}
                     onChange={(e) => setDepartment(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 pl-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
                   >
                     {departments.map(d => (
                       <option key={d.id} value={d.id}>{d.label}</option>
                     ))}
                   </select>
                </div>
              </div>

              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief Caption..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none" 
              />
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Additional details for field staff..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none resize-none" 
              />
              
              <button 
                onClick={detectLocation}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${location ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400'}`}
              >
                {loadingLocation ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                {location ? location.address : 'Tag My Location'}
              </button>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl font-bold transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-[2] py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2">
                Share to Feed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIssue;
