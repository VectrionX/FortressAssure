import { AssessmentModule, RiskLevel } from '../types';

export const SUPPORTED_MVP_MODULES = [
  AssessmentModule.ARCHITECTURE,
  AssessmentModule.VULNERABILITY,
] as const;

export type SupportedMvpModule = (typeof SUPPORTED_MVP_MODULES)[number];

export interface EvidenceFindingDraft {
  module: AssessmentModule;
  title: string;
  riskLevel: RiskLevel;
  observation: string;
  evidenceReference: string;
  evidenceExcerpt: string;
  impact: string;
  recommendation: string;
}

export interface EvidenceFinding extends EvidenceFindingDraft {
  id: string;
}

export interface AssessmentStatus {
  code: 'NOT_ASSESSED' | 'EVIDENCE_INTAKE_INCOMPLETE' | 'EVIDENCE_RECORDED_REQUIRES_REVIEW';
  label: string;
  detail: string;
  coveredModules: AssessmentModule[];
  missingModules: AssessmentModule[];
}

const REQUIRED_FIELDS: Array<[keyof EvidenceFindingDraft, string]> = [
  ['title', 'Finding title is required.'],
  ['observation', 'Assessor observation is required.'],
  ['evidenceReference', 'Evidence reference is required.'],
  ['evidenceExcerpt', 'Evidence excerpt or locator is required.'],
  ['impact', 'Impact statement is required.'],
  ['recommendation', 'Recommendation is required.'],
];

export const isSupportedModule = (module: AssessmentModule): module is SupportedMvpModule =>
  SUPPORTED_MVP_MODULES.includes(module as SupportedMvpModule);

export const validateEvidenceFindingDraft = (draft: EvidenceFindingDraft) => {
  const errors = REQUIRED_FIELDS
    .filter(([field]) => typeof draft[field] !== 'string' || !draft[field].trim())
    .map(([, message]) => message);

  if (!isSupportedModule(draft.module)) {
    errors.unshift(`${draft.module} is not supported for evidence intake in this MVP.`);
  }

  if (!Object.values(RiskLevel).includes(draft.riskLevel)) {
    errors.push('Assessor severity is invalid.');
  }

  return { valid: errors.length === 0, errors };
};

export const deriveAssessmentStatus = (findings: EvidenceFinding[]): AssessmentStatus => {
  const coveredModules = SUPPORTED_MVP_MODULES.filter(module =>
    findings.some(finding => finding.module === module),
  );
  const missingModules = SUPPORTED_MVP_MODULES.filter(module => !coveredModules.includes(module));

  if (coveredModules.length === 0) {
    return {
      code: 'NOT_ASSESSED',
      label: 'Not assessed',
      detail: 'No evidence-backed human findings have been recorded for the supported MVP modules.',
      coveredModules,
      missingModules,
    };
  }

  if (missingModules.length > 0) {
    return {
      code: 'EVIDENCE_INTAKE_INCOMPLETE',
      label: 'Evidence intake incomplete',
      detail: 'Evidence is recorded for part of the MVP boundary. No assurance outcome is available.',
      coveredModules,
      missingModules,
    };
  }

  return {
    code: 'EVIDENCE_RECORDED_REQUIRES_REVIEW',
    label: 'Evidence recorded — human review required',
    detail: 'Evidence has been recorded for each supported MVP module. This is not an assurance conclusion, control validation, or compliance attestation.',
    coveredModules,
    missingModules,
  };
};
