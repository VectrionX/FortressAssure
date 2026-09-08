import React from 'react';
import { AssessmentState } from '../types';
import { AssessmentStatus, SUPPORTED_MVP_MODULES } from '../services/assessmentModel';
import { RiskBadge } from './RiskBadge';

interface ReportTabProps {
  state: AssessmentState;
  status: AssessmentStatus;
}

export const ReportTab: React.FC<ReportTabProps> = ({ state, status }) => (
  <div className="space-y-6 pb-10">
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Evidence ledger</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Human findings register</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">This is not an assurance report. It is a local, browser-session record of human-entered observations and their stated evidence. It is not a control validation or compliance attestation.</p>
    </section>

    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><p className="text-xs font-black uppercase tracking-[0.16em]">Current status</p><h2 className="mt-1 text-xl font-bold">{status.label}</h2><p className="mt-2 text-sm leading-6">{status.detail}</p><p className="mt-3 text-xs font-semibold">Supported boundary: {SUPPORTED_MVP_MODULES.join(' · ')}</p></section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5 sm:p-6"><h2 className="text-lg font-bold text-slate-900">Evidence-linked findings</h2><p className="mt-1 text-sm text-slate-600">{state.findings.length} record{state.findings.length === 1 ? '' : 's'} in this browser session.</p></div>
      {state.findings.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No evidence-backed human findings have been recorded. The assessment remains not assessed.</div> : <div className="divide-y divide-slate-100">{state.findings.map(finding => <article key={finding.id} className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{finding.module}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{finding.title}</h3></div><RiskBadge level={finding.riskLevel} /></div><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-slate-700">Assessor observation</dt><dd className="mt-1 leading-6 text-slate-600">{finding.observation}</dd></div><div><dt className="font-bold text-slate-700">Evidence reference</dt><dd className="mt-1 break-words font-mono text-xs leading-6 text-slate-600">{finding.evidenceReference}</dd></div><div><dt className="font-bold text-slate-700">Evidence excerpt or locator</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-slate-600">{finding.evidenceExcerpt}</dd></div><div><dt className="font-bold text-slate-700">Impact and recommendation</dt><dd className="mt-1 leading-6 text-slate-600">{finding.impact}<br /><span className="font-semibold text-slate-800">Recommended action:</span> {finding.recommendation}</dd></div></dl><p className="mt-5 text-xs text-slate-500">Status: {finding.status} · Recorded {new Date(finding.recordedAt).toLocaleString()}</p></article>)}</div>}
    </section>
  </div>
);
