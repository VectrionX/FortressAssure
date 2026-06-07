
import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const styles = {
    [RiskLevel.CRITICAL]: 'bg-red-100 text-red-800 border-red-200',
    [RiskLevel.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
    [RiskLevel.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [RiskLevel.LOW]: 'bg-green-100 text-green-800 border-green-200',
    [RiskLevel.INFORMATIONAL]: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {level}
    </span>
  );
};
