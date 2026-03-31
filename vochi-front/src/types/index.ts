export type InterviewType = "rrhh" | "tecnica";
export type InterviewStatus = "pending" | "active" | "finished";
export type MessageRole = "ai" | "user";

export interface Interview {
  id: string;
  userId: string;
  jobDescription: string;
  company: string | null;
  role: string | null;
  type: InterviewType;
  status: InterviewStatus;
  score: number | null;
  duration: number | null;
  feedback: InterviewFeedback | null;
  createdAt: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  interviewId: string;
  role: MessageRole;
  text: string;
  createdAt: Date;
}

export interface FeedbackMetric {
  label: string;
  score: number;
  comment: string;
}

export interface FeedbackMoment {
  question: string;
  answer: string;
  tag: "fuerte" | "aceptable" | "debil";
}

export interface FeedbackImprovement {
  title: string;
  priority: "alta" | "media" | "baja";
  body: string;
  quote: string;
  action: string;
}

export interface InterviewFeedback {
  score: number;
  summary: string;
  tags: string[];
  positives: string[];
  improvements: FeedbackImprovement[];
  metrics: FeedbackMetric[];
  moments: FeedbackMoment[];
  nextSteps: string[];
}

export interface JobValidationResult {
  valid: boolean;
  role?: string;
  company?: string;
  stack?: string[];
  prepFacts?: string[];
  reason?: string;
}
