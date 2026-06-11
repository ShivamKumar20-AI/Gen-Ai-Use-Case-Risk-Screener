export interface UseCaseAssessment {
  summary: string;
  dataCategories: string[];
  riskFlags: string[];
  suggestedControls: string[];
  humanReviewQuestions: string[];
  overallRiskRating: "Low" | "Medium" | "High" | string;
  ratingExplanation: string;
}

export type BusinessFunction = 
  | "HR"
  | "Security"
  | "Compliance"
  | "Marketing"
  | "Operations"
  | "Customer Support"
  | "Other";

export interface SavedAssessment {
  id: string;
  title: string;
  description: string;
  businessFunction: BusinessFunction;
  createdAt: string;
  assessment: UseCaseAssessment;
}
