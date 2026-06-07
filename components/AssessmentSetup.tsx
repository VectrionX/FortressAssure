
import React, { useState } from 'react';
import { Criticality, SystemAsset, SystemCategory, AssessmentType, SolutionCategory, AssetType } from '../types';

interface AssessmentSetupProps {
  onInitialize: (data: {
    projectName: string;
    systemOwner: string;
    assetCriticality: Criticality;
    businessCriticality: Criticality;
    systemCategory: SystemCategory;
    assessmentType: AssessmentType;
    solutionCategory?: SolutionCategory;
    startDate: string;
    systemScope: SystemAsset[];
  }) => void;
  onLoadSample?: () => void;
}

export const AssessmentSetup: React.FC<AssessmentSetupProps> = ({ onInitialize, onLoadSample }) => {
  const [scopeInfo, setScopeInfo] = useState<{ count: number; fileName: string } | null>(null);
  const [scopeRaw, setScopeRaw] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(AssessmentType.BANKING);
  const [solutionCategory, setSolutionCategory] = useState<SolutionCategory>(SolutionCategory.SIEM);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Parse CSV: IP, Hostname, AssetType, Environment
    const parsedScope: SystemAsset[] = scopeRaw.split('\n')
      .filter(l => l.trim())
      .map(line => {
        const [ip, hostname, type, env] = line.split(',').map(s => s.trim());
        return { 
          ip: ip || undefined, 
          hostname: hostname || 'Unknown',
          type: (type as AssetType) || AssetType.SERVER,
          environment: env || 'Production'
        };
      });

    onInitialize({
      projectName: formData.get('projectName') as string,
      systemOwner: formData.get('systemOwner') as string,
      assetCriticality: formData.get('assetCriticality') as Criticality,
      businessCriticality: formData.get('businessCriticality') as Criticality,
      systemCategory: assessmentType === AssessmentType.BANKING ? SystemCategory.BANKING : SystemCategory.SECURITY,
      assessmentType: assessmentType,
      solutionCategory: assessmentType === AssessmentType.SECURITY_SOLUTION ? solutionCategory : undefined,
      startDate: formData.get('startDate') as string,
      systemScope: parsedScope,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim()).length;
      setScopeRaw(text);
      setScopeInfo({ count: lines, fileName: file.name });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-inter">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="bg-slate-800 p-8 text-white relative">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Assessment Initiation
              </h1>
              <p className="text-slate-400 mt-2">Define the project identity and master asset inventory.</p>
            </div>
            {onLoadSample && (
              <button 
                type="button" 
                onClick={onLoadSample}
                className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold rounded-lg hover:bg-emerald-500/20 transition-all text-xs flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Load Core Banking Sample
              </button>
            )}
          </div>
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setAssessmentType(AssessmentType.BANKING)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${assessmentType === AssessmentType.BANKING ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                <span className="text-xs font-bold uppercase tracking-tighter text-center">Banking System / App</span>
              </button>
              <button 
                type="button"
                onClick={() => setAssessmentType(AssessmentType.SECURITY_SOLUTION)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${assessmentType === AssessmentType.SECURITY_SOLUTION ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-xs font-bold uppercase tracking-tighter text-center">Security Solution</span>
              </button>
            </div>
          </div>

          {assessmentType === AssessmentType.SECURITY_SOLUTION && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Solution Category</label>
              <select 
                value={solutionCategory} 
                onChange={(e) => setSolutionCategory(e.target.value as SolutionCategory)} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(SolutionCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Name</label>
              <input name="projectName" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none" placeholder="e.g. Swift-Gateway-V2" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System/Solution Owner</label>
              <input name="systemOwner" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none" placeholder="Department / Manager" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Business Criticality</label>
              <select name="businessCriticality" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none">
                {Object.values(Criticality).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data Criticality</label>
              <select name="assetCriticality" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none">
                {Object.values(Criticality).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Start Date</label>
            <input type="date" name="startDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-emerald-600">Master Asset Inventory (CSV)</label>
            <div className={`relative group border-2 border-dashed rounded-2xl transition-all p-6 flex flex-col items-center justify-center ${scopeInfo ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-400'}`}>
              <input 
                type="file" 
                required={!scopeRaw}
                accept=".csv,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              {scopeInfo ? (
                <div className="text-center animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-sm font-bold text-emerald-800">Inventory Loaded Successfully</p>
                  <p className="text-[10px] text-emerald-600 font-medium">{scopeInfo.count} items imported from {scopeInfo.fileName}</p>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="text-xs font-medium text-slate-600">Click or drag CSV (IP, Hostname, Type, Environment)</p>
                </>
              )}
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]">
            Launch Assurance Engine
          </button>
        </div>
      </form>
    </div>
  );
};
