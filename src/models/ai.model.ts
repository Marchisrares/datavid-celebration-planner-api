export interface AiMessageRequest {
  memberId: number;
  tone?: string;
  locale?: string;
  sendEmail?: boolean;
  dryRunEmail?: boolean;
}

export interface AiMessageResponse {
  message: string;
  explanation: {
    model: string;
    params: Record<string, any>;
    promptOrMethod: string;
    rationale: string;
  };
  sent?: {
    dryRun: boolean;
    provider: string;
  };
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}
