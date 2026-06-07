
import React, { useState, useEffect } from 'react';
import { AssessmentModule, RiskLevel, Finding, AssessmentState, Criticality, SystemAsset, SystemCategory, AssessmentType, SolutionCategory } from './types';
import { Dashboard } from './components/Dashboard';
import { AssessmentSetup } from './components/AssessmentSetup';
import { ReportTab } from './components/ReportTab'; // Import ReportTab
import { DocumentationTab } from './components/DocumentationTab';
import { 
  runLocalNetworkAudit, 
  runGenericAudit, 
  runVulnerabilityAudit, 
  runLoggingAudit, 
  runSecurityControlAudit, 
  runGovernanceAudit, 
  runThirdPartyAudit, 
  runDataProtectionAudit, 
  runAppSecAudit, 
  runHardeningAudit 
} from './services/localEngine';
import { getCoreBankingSampleData } from './services/sampleData';

import { GenericModule } from './components/modules/GenericModule';

// Module Imports
import { NetworkModule } from './components/modules/NetworkModule';
import { IdentityModule } from './components/modules/IdentityModule';
import { VulnerabilityModule } from './components/modules/VulnerabilityModule';
import { AppSecModule } from './components/modules/AppSecModule';
import { DataProtectionModule } from './components/modules/DataProtectionModule';
import { LoggingModule } from './components/modules/LoggingModule';
import { IncidentModule } from './components/modules/IncidentModule';
import { HardeningModule } from './components/modules/HardeningModule';
import { ThirdPartyModule } from './components/modules/ThirdPartyModule';
import { GovernanceModule } from './components/modules/GovernanceModule';
import { OtherModule } from './components/modules/OtherModule';
import { SecurityControlAssuranceModule } from './components/modules/SecurityControlAssuranceModule';
import { RiskBadge } from './components/RiskBadge';

const INITIAL_MODULE_SCORES = Object.values(AssessmentModule).reduce((acc, module) => {
  acc[module] = 0;
  return acc;
}, {} as Record<AssessmentModule, number>);

const App: React.FC = () => {
  const [state, setState] = useState<AssessmentState>({
    projectName: '',
    systemOwner: '',
    assetCriticality: Criticality.MEDIUM,
    businessCriticality: Criticality.MEDIUM,
    systemCategory: SystemCategory.BANKING,
    assessmentType: AssessmentType.BANKING,
    startDate: '',
    systemScope: [],
    findings: [],
    moduleScores: INITIAL_MODULE_SCORES,
    enabledModules: Object.values(AssessmentModule),
    isInitialized: false
  });

  // Updated Tab Type
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'register' | 'report' | 'documentation' | 'settings'>('overview');
  const [selectedModule, setSelectedModule] = useState<AssessmentModule | 'ASSURANCE'>(AssessmentModule.ARCHITECTURE);
  const [moduleInputs, setModuleInputs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    if (state.systemCategory === SystemCategory.SECURITY && state.isInitialized) {
      setSelectedModule('ASSURANCE');
    }
  }, [state.systemCategory, state.isInitialized]);

  const handleInitialize = (initData: any) => {
    setState(prev => ({ ...prev, ...initData, isInitialized: true }));
  };

  const handleLoadSample = () => {
    const sampleData = getCoreBankingSampleData();
    setState(prev => ({
      ...prev,
      ...sampleData,
      isInitialized: true
    }));
  };

  const handleAppSecAudit = (module: AssessmentModule, data: any) => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runAppSecAudit(data);
      processFindings(results, module);
      setIsProcessing(false);
    }, 1000);
  };

  const handleSecurityAssurance = (data: any) => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runSecurityControlAudit(data);
      setState(prev => {
        const otherFindings = prev.findings.filter(f => !f.id.startsWith('sec-'));
        return { ...prev, findings: [...otherFindings, ...results] };
      });
      setIsProcessing(false);
    }, 1000);
  };

  const handleGovernanceAudit = (module: AssessmentModule, data: any) => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runGovernanceAudit(data);
      processFindings(results, module);
      setIsProcessing(false);
    }, 1000);
  };

  const handleThirdPartyAudit = (module: AssessmentModule, data: any) => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runThirdPartyAudit(data);
      processFindings(results, module);
      setIsProcessing(false);
    }, 1000);
  };

  const handleDataProtectionAudit = (module: AssessmentModule, data: any) => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runDataProtectionAudit(data);
      processFindings(results, module);
      setIsProcessing(false);
    }, 1000);
  };

  const handleNetworkAudit = (archData: string, fwData: string, scopeIps: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runLocalNetworkAudit(archData, fwData, scopeIps);
      processFindings(results, AssessmentModule.ARCHITECTURE);
      setIsProcessing(false);
    }, 800);
  };

  const handleLoggingAudit = (data: { checklist: any; siemContent: string; config: any }) => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runLoggingAudit(data.checklist, data.siemContent, state.systemScope, data.config);
      processFindings(results, AssessmentModule.LOGGING);
      setIsProcessing(false);
    }, 1500);
  };

  const handleEvidenceAudit = (module: AssessmentModule, evidence: any) => {
    setIsProcessing(true);
    const evidenceSnap = JSON.parse(JSON.stringify(evidence));
    setTimeout(() => {
      const results = runVulnerabilityAudit(evidenceSnap, state.assetCriticality);
      const taggedResults = results.map(r => ({ ...r, module }));
      processFindings(taggedResults, module);
      setIsProcessing(false);
    }, 1200);
  };

  const handleGenericAnalysis = (module: AssessmentModule) => {
    const input = moduleInputs[module] || "";
    setIsProcessing(true);
    setTimeout(() => {
      const results = runGenericAudit(module, input);
      processFindings(results, module);
      setIsProcessing(false);
    }, 500);
  };

  const handleAddManualFinding = (manual: any) => {
    const targetModule = selectedModule === 'ASSURANCE' ? AssessmentModule.GOVERNANCE : selectedModule;
    const newFinding: Finding = {
      id: `manual-${Date.now()}`,
      module: targetModule as AssessmentModule,
      title: `[Manual] ${manual.title}`,
      riskLevel: manual.riskLevel,
      impact: manual.impact,
      recommendation: manual.recommendation,
      status: 'Open'
    };
    processFindings([newFinding], targetModule as AssessmentModule);
    setShowManualForm(false);
  };

  const processFindings = (newFindings: Finding[], module: AssessmentModule) => {
    setState(prev => {
        const otherFindings = prev.findings.filter(f => f.module !== module || f.title.startsWith('[Manual]'));
        const combinedFindings = [...otherFindings, ...newFindings];
        const moduleFindings = combinedFindings.filter(f => f.module === module);
        
        let multiplier = prev.assetCriticality === Criticality.HIGH ? 1.5 : prev.assetCriticality === Criticality.LOW ? 0.7 : 1;
        
        if (prev.systemCategory === SystemCategory.SECURITY && (module === AssessmentModule.ARCHITECTURE || module === AssessmentModule.IDENTITY)) {
          multiplier *= 1.25;
        }

        const riskPenalty = moduleFindings.reduce((acc, curr) => {
            if (curr.riskLevel === RiskLevel.CRITICAL) return acc + (30 * multiplier);
            if (curr.riskLevel === RiskLevel.HIGH) return acc + (15 * multiplier);
            if (curr.riskLevel === RiskLevel.MEDIUM) return acc + (5 * multiplier);
            return acc + (1 * multiplier);
        }, 0);
        
        const score = Math.max(0, 100 - riskPenalty);
        return {
            ...prev,
            findings: combinedFindings,
            moduleScores: { ...prev.moduleScores, [module]: score }
        };
    });
  };

  if (!state.isInitialized) return <AssessmentSetup onInitialize={handleInitialize} onLoadSample={handleLoadSample} />;

  const visibleModules = state.enabledModules;
  const currentFindings = selectedModule === 'ASSURANCE' 
    ? state.findings.filter(f => f.id.startsWith('sec-'))
    : state.findings.filter(f => f.module === selectedModule);

  const renderModule = () => {
    if (selectedModule === 'ASSURANCE') {
      return <SecurityControlAssuranceModule 
        onAnalyze={handleSecurityAssurance} 
        isProcessing={isProcessing} 
        findings={currentFindings} 
      />;
    }

    const commonProps = {
      isProcessing,
      findings: currentFindings,
      showManualForm,
      onToggleManualForm: () => setShowManualForm(!showManualForm),
      onAddManual: handleAddManualFinding,
    };

    const genericProps = {
      ...commonProps,
      inputValue: moduleInputs[selectedModule] || '',
      onInputChange: (v: string) => setModuleInputs({...moduleInputs, [selectedModule]: v}),
      onAnalyze: () => handleGenericAnalysis(selectedModule as AssessmentModule),
    };

    switch (selectedModule) {
      case AssessmentModule.ARCHITECTURE: return <NetworkModule {...commonProps} onAnalyze={handleNetworkAudit} systemScope={state.systemScope} />;
      case AssessmentModule.IDENTITY: return <IdentityModule {...genericProps} />;
      case AssessmentModule.VULNERABILITY: return <VulnerabilityModule {...commonProps} onAnalyze={handleEvidenceAudit} />;
      case AssessmentModule.APPLICATION: return <AppSecModule {...commonProps} onAnalyze={handleAppSecAudit} />;
      case AssessmentModule.DATA: return <DataProtectionModule {...commonProps} onAnalyze={handleDataProtectionAudit} />;
      case AssessmentModule.LOGGING: return <LoggingModule {...commonProps} onAnalyze={(m, d) => handleLoggingAudit(d)} systemScope={state.systemScope} />;
      case AssessmentModule.INCIDENT: return <IncidentModule {...genericProps} />;
      case AssessmentModule.HARDENING: return <HardeningModule {...commonProps} onAnalyze={handleEvidenceAudit} />;
      case AssessmentModule.THIRD_PARTY: return <ThirdPartyModule {...commonProps} onAnalyze={handleThirdPartyAudit} />;
      case AssessmentModule.GOVERNANCE: return <GovernanceModule {...commonProps} onAnalyze={handleGovernanceAudit} />;
      case AssessmentModule.OTHER: return <OtherModule {...genericProps} />;
      case AssessmentModule.CLOUD_SECURITY: return <GenericModule {...genericProps} module={AssessmentModule.CLOUD_SECURITY} />;
      case AssessmentModule.ENDPOINT_SECURITY: return <GenericModule {...genericProps} module={AssessmentModule.ENDPOINT_SECURITY} />;
      case AssessmentModule.EMAIL_SECURITY: return <GenericModule {...genericProps} module={AssessmentModule.EMAIL_SECURITY} />;
      case AssessmentModule.SECURITY_OPERATIONS: return <GenericModule {...genericProps} module={AssessmentModule.SECURITY_OPERATIONS} />;
      case AssessmentModule.BUSINESS_CONTINUITY: return <GenericModule {...genericProps} module={AssessmentModule.BUSINESS_CONTINUITY} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${state.systemCategory === SystemCategory.SECURITY ? 'bg-blue-600' : 'bg-slate-800'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">FortressAssure</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[10px] text-slate-500 uppercase font-semibold">{state.projectName}</span>
                 <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${state.systemCategory === SystemCategory.SECURITY ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{state.systemCategory}</span>
              </div>
            </div>
          </div>
          <nav className="flex space-x-1">
            {['overview', 'modules', 'register', 'report', 'documentation', 'settings'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab as any); setShowManualForm(false); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {activeTab === 'overview' ? <Dashboard data={state} /> : 
         activeTab === 'report' ? <ReportTab state={state} /> :
         activeTab === 'documentation' ? <DocumentationTab /> :
         activeTab === 'modules' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-1">
            {state.systemCategory === SystemCategory.SECURITY && (
              <button 
                onClick={() => { setSelectedModule('ASSURANCE'); setShowManualForm(false); }} 
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-black transition-all border-l-4 mb-4 ${selectedModule === 'ASSURANCE' ? 'bg-blue-900 text-white border-blue-400 shadow-md' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200'}`}
              >
                Control Assurance
              </button>
            )}
            {visibleModules.map(module => (
              <button key={module} onClick={() => { setSelectedModule(module); setShowManualForm(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedModule === module ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border'}`}>
                {module} {state.moduleScores[module] > 0 && <span className="float-right text-[10px]">{Math.round(state.moduleScores[module])}%</span>}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 bg-white p-8 rounded-xl border relative min-h-[600px]">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{selectedModule === 'ASSURANCE' ? 'Security Control Assurance' : selectedModule}</h2>
            {renderModule()}
          </div>
        </div>
      ) : activeTab === 'register' ? (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900">Findings Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b text-slate-500"><tr><th className="px-6 py-4">Module</th><th className="px-6 py-4">Issue</th><th className="px-6 py-4 text-center">Severity</th><th className="px-6 py-4">Status</th></tr></thead><tbody className="divide-y">
              {state.findings.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/30"><td className="px-6 py-4">{f.module}</td><td className="px-6 py-4 font-bold">{f.title}</td><td className="px-6 py-4 text-center"><RiskBadge level={f.riskLevel} /></td><td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-[10px] font-bold uppercase rounded">Open</span></td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border">Settings. Under Construction.</div>
      )}</main>
    </div>
  );
};

export default App;
