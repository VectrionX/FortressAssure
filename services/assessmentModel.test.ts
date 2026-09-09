import { describe, expect, it } from 'vitest';
import { AssessmentModule, RiskLevel } from '../types';
import { createSampleAssessment } from './sampleAssessment';
import {
  deriveAssessmentStatus,
  isSupportedModule,
  validateEvidenceFindingDraft,
  type EvidenceFindingDraft,
} from './assessmentModel';

const validDraft: EvidenceFindingDraft = {
  module: AssessmentModule.ARCHITECTURE,
  title: 'Broad firewall rule observed',
  riskLevel: RiskLevel.HIGH,
  observation: 'The assessor observed a broad allow rule in the supplied export.',
  evidenceReference: 'FW-EDGE-01 running-config, line 184',
  evidenceExcerpt: 'permit ip any any',
  impact: 'The rule may permit unnecessary network paths.',
  recommendation: 'Review and constrain the rule to documented flows.',
};

describe('supported assessment boundary', () => {
  it('supports only the two evidence-intake MVP modules', () => {
    expect(isSupportedModule(AssessmentModule.ARCHITECTURE)).toBe(true);
    expect(isSupportedModule(AssessmentModule.VULNERABILITY)).toBe(true);
    expect(isSupportedModule(AssessmentModule.IDENTITY)).toBe(false);
  });

  it('rejects a human finding without an evidence reference and excerpt', () => {
    const result = validateEvidenceFindingDraft({
      ...validDraft,
      evidenceReference: '',
      evidenceExcerpt: '',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Evidence reference is required.');
    expect(result.errors).toContain('Evidence excerpt or locator is required.');
  });

  it('rejects a finding for a module outside the MVP boundary', () => {
    const result = validateEvidenceFindingDraft({
      ...validDraft,
      module: AssessmentModule.IDENTITY,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Identity & Access is not supported for evidence intake in this MVP.');
  });

  it('rejects an invalid runtime severity instead of recording an unbounded value', () => {
    const result = validateEvidenceFindingDraft({
      ...validDraft,
      riskLevel: 'SEVERE' as RiskLevel,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Assessor severity is invalid.');
  });
});

describe('assessment status', () => {
  it('is not assessed when no evidence-backed findings exist', () => {
    expect(deriveAssessmentStatus([])).toMatchObject({
      code: 'NOT_ASSESSED',
      label: 'Not assessed',
      detail: 'No evidence-backed human findings have been recorded for the supported MVP modules.',
      coveredModules: [],
      missingModules: [AssessmentModule.ARCHITECTURE, AssessmentModule.VULNERABILITY],
    });
  });

  it('stays incomplete until both supported modules have evidence', () => {
    expect(deriveAssessmentStatus([{ ...validDraft, id: 'finding-1' }])).toMatchObject({
      code: 'EVIDENCE_INTAKE_INCOMPLETE',
      label: 'Evidence intake incomplete',
      coveredModules: [AssessmentModule.ARCHITECTURE],
      missingModules: [AssessmentModule.VULNERABILITY],
    });
  });

  it('does not issue assurance after evidence exists for every supported module', () => {
    expect(deriveAssessmentStatus([
      { ...validDraft, id: 'finding-1' },
      { ...validDraft, id: 'finding-2', module: AssessmentModule.VULNERABILITY },
    ])).toMatchObject({
      code: 'EVIDENCE_RECORDED_REQUIRES_REVIEW',
      label: 'Evidence recorded — human review required',
      coveredModules: [AssessmentModule.ARCHITECTURE, AssessmentModule.VULNERABILITY],
      missingModules: [],
    });
  });
});

describe('synthetic sample assessment', () => {
  it('creates a deterministic, read-only synthetic demonstration state', () => {
    expect(createSampleAssessment()).toEqual(createSampleAssessment());
    expect(createSampleAssessment()).toMatchObject({
      mode: 'sample',
      isInitialized: true,
      projectName: 'Sample Payments Gateway',
      systemOwner: 'Synthetic Example Team',
    });
  });

  it('uses only supported modules and clearly synthetic evidence records', () => {
    const sample = createSampleAssessment();

    expect(sample.findings.length).toBeGreaterThan(0);
    for (const finding of sample.findings) {
      expect(isSupportedModule(finding.module)).toBe(true);
      expect(finding.id).toMatch(/^sample-/);
      expect(finding.evidenceReference).toContain('SAMPLE-');
      expect(finding.evidenceExcerpt).toContain('Synthetic');
    }
  });
});
