
import React, { useState } from 'react';
import { ShieldAlert, Zap, Thermometer, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { analyzeRoadDamage, DamageAnalysis } from '../services/geminiService';

const RoadAI: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DamageAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
      const analysis = await analyzeRoadDamage(base64);
      setResult(analysis);
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-3xl border-l-4 border-l-sky-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500 dark:text-sky-400">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Live AI Processing</h3>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">98.4%</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Model Accuracy (YOLOv8 v2.1)</p>
        </div>
        
        <div className="glass p-6 rounded-3xl border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 dark:text-amber-400">
              <Thermometer size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Road Stress Level</h3>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">High</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Due to recent temperature shifts</p>
        </div>

        <div className="glass p-6 rounded-3xl border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Cost Optimization</h3>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">-12%</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Budget saved via predictive fix</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center border-dashed border-2 border-slate-300 dark:border-white/10 min-h-[400px]">
          {imageUrl ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <img src={imageUrl} alt="Detection" className="w-full h-full object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sky-400 font-medium animate-pulse">Running Neural Analysis...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="text-slate-400 dark:text-slate-500" size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Initialize AI Inspector</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">Upload raw footage or images to detect damage types and severity automatically.</p>
              <label className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-2xl font-bold transition-colors cursor-pointer inline-block">
                Choose Image / Live Feed
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-3xl">
          <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
            <AlertTriangle className="text-amber-500" />
            Analysis Results
          </h4>
          
          {result ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Damage Type</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">{result.type}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Severity Index</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{result.severity}/10</p>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${result.severity > 7 ? 'bg-red-500' : 'bg-amber-500'}`} 
                        style={{ width: `${result.severity * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">AI Classification</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{result.description}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Maintenance Suggestion</p>
                <div className="flex items-start gap-3 mt-2">
                  <CheckCircle2 className="text-emerald-500 mt-1" size={18} />
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium italic">{result.maintenanceSuggestion}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest text-xs">Priority Vector</span>
                <span className="text-2xl font-mono font-bold text-sky-600 dark:text-sky-400">{result.priority}%</span>
              </div>

              <button className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-bold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors">
                Generate Official Report & Dispatch
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-50 space-y-4">
              <Zap size={48} />
              <p>Awaiting engine input data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadAI;
