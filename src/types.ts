export type JobTitle = 'محصل' | 'مشرف' | 'مدير' | 'غير ذلك';

export interface EmployeeData {
  employeeName: string;
  department: string;
  jobTitle: string;
  stages: string[];
  products: string[];
}

export interface SurveyResponse extends EmployeeData {
  id: string;
  employeeId?: string;
  question1: 'نعم' | 'لا';
  question2: 'نعم، سيساعدني' | 'لا، لن يساعدني';
  question3: 'نعم' | 'لا';
  question4: 'نعم' | 'لا';
  question5: string; // "١ — لا أتوقع أن يساهم" | "٢ — مساهمة محدودة" | "٣ — مساهمة متوسطة" | "٤ — مساهمة كبيرة" | "٥ — مساهمة كبيرة جدًا"
  question6?: string; // ملاحظات ومقترحات تطوير الفكرة (اختياري)
  submittedAt: string;
}

export interface SurveyStatistics {
  totalParticipants: number;
  q1YesPercentage: number;
  q1YesCount: number;
  q1NoCount: number;
  q2YesPercentage: number;
  q2YesCount: number;
  q2NoCount: number;
  q3YesPercentage: number;
  q3YesCount: number;
  q3NoCount: number;
  q4YesPercentage: number;
  q4YesCount: number;
  q4NoCount: number;
  q5AverageScore: number;
  q5Distribution: {
    score: number;
    label: string;
    count: number;
    percentage: number;
  }[];
}

export interface QuestionDefinition {
  id: number;
  question: string;
  subText?: string;
  bulletPoints?: string[];
  options: string[];
  type?: 'options' | 'textarea';
  isOptional?: boolean;
  placeholder?: string;
}

// CPF Validation Specific Types
export interface CpfValidationResponse {
  id: string;
  submittedAt: string;
  q1Score: number;
  q1Text: string;
  q2Score: number;
  q2Text: string;
  q3Score: number;
  q3Text: string;
  q4Score: number;
  q4Text: string;
  q5Score: number;
  q5Text: string;
  q6Score: number;
  q6Text: string;
  q7Score: number;
  q7Text: string;
  q8Score: number;
  q8Text: string;
  q9Score: number;
  q9Text: string;
  q10Score: number;
  q10Text: string;
  experienceYears: string;
  portfolioType: string;
  region?: string;
}

export interface CpfValidationQuestionDistribution {
  score: number;
  label: string;
  count: number;
  percentage: number;
}

export interface CpfValidationQuestionStat {
  id: number;
  title: string;
  dimensionId: number;
  totalAnswers: number;
  averageScore: number;
  distribution: CpfValidationQuestionDistribution[];
}

export interface CpfValidationDimensionStat {
  id: number;
  title: string;
  questions: number[];
  averageScore: number;
  description: string;
}

export interface CpfValidationComparativeGroup {
  group: string;
  count: number;
  dim1Avg: number;
  dim2Avg: number;
  dim3Avg: number;
  dim4Avg: number;
  overallAvg: number;
}

export interface CpfValidationStatistics {
  totalParticipants: number;
  completionRate: number;
  overallAverage: number;
  lastResponseDate: string | null;
  dimensions: CpfValidationDimensionStat[];
  questions: CpfValidationQuestionStat[];
  comparativeByExperience: CpfValidationComparativeGroup[];
  comparativeByPortfolio: CpfValidationComparativeGroup[];
  comparativeByRegion: CpfValidationComparativeGroup[];
}

