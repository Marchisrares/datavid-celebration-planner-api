export interface AiProvider {
  generate(input: {
    firstName: string;
    city: string;
    country: string;
    ageTurning: number;
    tone?: string;
    locale: string;
  }): Promise<{
    message: string;
    explanation: {
      model: string;
      params: Record<string, any>;
      promptOrMethod: string;
      rationale: string;
    };
  }>;
}
