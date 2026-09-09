import React, { useState } from 'react';
import { AssessmentType, AssetType, Criticality, SystemAsset, SystemCategory } from '../types';

interface AssessmentSetupProps {
  onInitialize: (data: Omit<import('../types').AssessmentState, 'findings' | 'isInitialized' | 'mode'>) => void;
  onLoadSample: () => void;
}

export const AssessmentSetup: React.FC<AssessmentSetupProps> = ({ onInitialize, onLoadSample }) => {
  const [scopeRaw, setScopeRaw] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const systemScope: SystemAsset[] = scopeRaw
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [ip, hostname, type, environment] = line.split(',').map(value => value.trim());
        return {
          ip: ip || undefined,
          hostname: hostname || 'Unspecified asset',
          type: (Object.values(AssetType).includes(type as AssetType) ? type : AssetType.SERVER) as AssetType,
          environment: environment || 'Unspecified',
        };
      });

    onInitialize({
      projectName: String(formData.get('projectName') || ''),
      systemOwner: String(formData.get('systemOwner') || ''),
      assetCriticality: formData.get('assetCriticality') as Criticality,
      businessCriticality: formData.get('businessCriticality') as Criticality,
      assessmentType: formData.get('assessmentType') as AssessmentType,
      systemCategory: formData.get('assessmentType') === AssessmentType.SECURITY_SOLUTION
        ? SystemCategory.SECURITY
        : SystemCategory.BANKING,
      startDate: String(formData.get('startDate') || ''),
      systemScope,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex items-center justify-center font-sans">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl">
        <div className="bg-slate-900 px-6 py-7 sm:px-10 sm:py-9 text-white">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Evidence-led MVP</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Start an evidence register</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">FortressAssureX records human findings linked to supplied evidence. It does not validate controls, calculate posture, or provide a compliance attestation.</p>
        </div>

        <div className="space-y-6 p-6 sm:p-10">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <strong>Current boundary:</strong> evidence intake is available only for Architecture &amp; Network and Vulnerability &amp; Exposure. Other domains are shown as not supported in this MVP.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Project name
              <input name="projectName" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" placeholder="e.g. Payments gateway review" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">System owner
              <input name="systemOwner" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" placeholder="Team or accountable owner" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-700">Assessment context
              <select name="assessmentType" defaultValue={AssessmentType.BANKING} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                {Object.values(AssessmentType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Business criticality
              <select name="businessCriticality" defaultValue={Criticality.MEDIUM} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                {Object.values(Criticality).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Data criticality
              <select name="assetCriticality" defaultValue={Criticality.MEDIUM} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                {Object.values(Criticality).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">Start date
            <input name="startDate" type="date" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>

          <label className="block text-sm font-semibold text-slate-700">Optional asset inventory
            <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">Paste one asset per line as <code>IP, hostname, asset type, environment</code>. This is scope context only; it is not scanned or verified.</span>
            <textarea value={scopeRaw} onChange={event => setScopeRaw(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-mono text-xs outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" placeholder="10.0.0.10, edge-fw-01, Network Device, Production" />
          </label>

          <button type="submit" className="w-full rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">Create evidence register</button>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center"><p className="text-sm font-semibold text-slate-800">Want to explore the workspace first?</p><p className="mt-1 text-sm text-slate-600">Load a read-only synthetic demonstration. No assessment is performed and no evidence is collected.</p><button type="button" onClick={onLoadSample} className="mt-3 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:border-cyan-700 hover:text-cyan-800">Load sample assessment</button></div>
        </div>
      </form>
    </div>
  );
};
