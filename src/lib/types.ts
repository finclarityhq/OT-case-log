export type CaseLog = {
  id: string;
  date: Date;
  location?: string;
  isEmergency: boolean;
  patientId: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  asaGrade: 'I' | 'II' | 'III' | 'IV' | 'V';
  comorbidities: string[];
  specialty: string;
  surgeryType: string;
  patientPosition: 'Supine' | 'Prone' | 'Lithotomy' | 'Lateral';
  anesthesiaTechnique: string;
  hasAdjuvants: boolean;
  adjuvantDetails?: string;
  blockDetails?: BlockDetails;
  duration: number; // in minutes
  hemodynamicStatus: 'Stable' | 'Mild fluctuations' | 'Significant instability';
  hasAirwayDifficulty: boolean;
  complications: string[];
  postOpAnalgesia: 'Adequate' | 'Inadequate';
  rescueAnalgesiaRequired: boolean;
  notes?: string;
  createdAt: Date;
};

export type BlockDetails = {
  type: string;
  level: string;
  side: 'Left' | 'Right' | 'Bilateral';
  isUltrasoundGuided: boolean;
  localAnesthetic: string;
};

export type DashboardStats = {
  totalCases: number;
  monthlyCaseCount: number;
  mostCommonAsaGrade: string;
  mostCommonTechnique: string;
  asaGradeDistribution: { name: string; value: number }[];
  techniqueDistribution: { name: string; value: number; fill: string }[];
};
