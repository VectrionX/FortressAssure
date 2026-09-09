import React from 'react';
import { AssessmentModule, AssessmentState, Finding, RiskLevel } from '../types';
import { AssessmentStatus, SUPPORTED_MVP_MODULES } from '../services/assessmentModel';
import { RiskBadge } from './RiskBadge';

interface DashboardProps {
  data: AssessmentState;
  status: AssessmentStatus;
  onOpenEvidence: () => void;
}

const statusStyle: Record<AssessmentStatus['code'], string> = {
  NOT_ASSESSED: 'border-slate-300 bg-slate-50 text-slate-800',
  EVIDENCE_INTAKE_INCOMPLETE: 'border-amber-300 bg-amber-50 text-amber-950',
  EVIDENCE_RECORDED_REQUIRES_REVIEW: 'border-cyan-300 bg-cyan-50 text-cyan-950',
};

const findingCounts = (findings: Finding[]) => Object.values(RiskLevel).map(level => ({
  level,
  count: findings.filter(finding => finding.riskLevel === level).length,
}));

export const Dashboard: React.FC<DashboardProps> = ({ data, status, onOpenEvidence }) => (
  <div className="space-y-6 sm:space-y-8">
    <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">FortressAssureX · {data.mode === 'sample' ? 'sample assessment — synthetic data' : 'evidence register'}</p>
      <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{data.projectName}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Scope owner: {data.systemOwner}. This workspace records assessor-entered findings and evidence; it makes no automated control-validation or compliance claim.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="block text-xs uppercase tracking-wider text-slate-400">Scope assets</span><strong className="text-xl">{data.systemScope.length}</strong></div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="block text-xs uppercase tracking-wider text-slate-400">Evidence records</span><strong className="text-xl">{data.findings.length}</strong></div>
        </div>
      </div>
    </section>

    {data.mode === 'sample' ? <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950" aria-label="Sample assessment notice"><p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Demonstration only</p><h3 className="mt-1 text-xl font-bold">Illustrative evidence records</h3><p className="mt-2 max-w-4xl text-sm leading-6">These synthetic records do not represent assessment findings, control validation, posture, or assurance for any real environment.</p></section> : <section className={`rounded-2xl border p-5 ${statusStyle[status.code]}`} aria-label="Assessment status"><p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Assessment status</p><h3 className="mt-1 text-xl font-bold">{status.label}</h3><p className="mt-2 max-w-4xl text-sm leading-6">{status.detail}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">{SUPPORTED_MVP_MODULES.map(module => <span key={module} className={`rounded-full px-3 py-1 ${status.coveredModules.includes(module) ? 'bg-cyan-700 text-white' : 'bg-white/70 text-slate-700 ring-1 ring-inset ring-slate-300'}`}>{module}: {status.coveredModules.includes(module) ? 'evidence recorded' : 'not assessed'}</span>)}</div></section>}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {findingCounts(data.findings).map(({ level, count }) => <div key={level} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><RiskBadge level={level as RiskLevel} /><div className="mt-3 text-3xl font-bold text-slate-900">{count}</div><p className="text-xs text-slate-500">{data.mode === 'sample' ? 'synthetic records' : 'human-recorded findings'}</p></div>)}
    </section>

    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-slate-900">Current MVP boundary</h3><p className="mt-1 text-sm text-slate-600">Only the modules below accept evidence-backed human findings. Every other domain remains explicitly unsupported.</p></div>{data.mode === 'sample' ? <span className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">Read-only sample</span> : <button onClick={onOpenEvidence} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-800">Record evidence</button>}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{SUPPORTED_MVP_MODULES.map(module => <div key={module} className="rounded-xl border border-cyan-200 bg-cyan-50 p-4"><p className="font-bold text-cyan-950">{module}</p><p className="mt-1 text-xs leading-5 text-cyan-900">Supported for evidence-linked human findings only.</p></div>)}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="text-lg font-bold text-slate-900">Excluded outcomes</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600"><li>• No posture or maturity score</li><li>• No automated analysis of pasted text</li><li>• No control effectiveness validation</li><li>• No compliance attestation</li></ul></div>
    </section>
  </div>
);
