import { AiProvider } from './ai-provider.interface';
import { env } from '../../config/env';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAiProvider implements AiProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.openaiKey;
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY in .env file.');
    }
  }

  async generate(input: {
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
  }> {
    const { firstName, city, country, ageTurning, tone = 'friendly', locale } = input;

    // Construct the prompt
    const systemPrompt = `You are a birthday message generator. Create personalized, culturally appropriate birthday messages.
- Keep messages concise (2-3 sentences)
- Use the specified tone (${tone})
- Write in ${locale} language/locale
- Incorporate the person's location naturally
- Be warm and genuine`;

    const userPrompt = `Generate a ${tone} birthday message for ${firstName} who is turning ${ageTurning} years old and lives in ${city}, ${country}. Write in ${locale} locale.`;

    const temperature = tone === 'formal' ? 0.7 : 0.9;
    const maxTokens = 150;

    const requestBody: OpenAIRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as OpenAIResponse;

      const message = data.choices[0]?.message?.content?.trim() || '';

      if (!message) {
        throw new Error('OpenAI returned an empty message');
      }

      return {
        message,
        explanation: {
          model: data.model || 'gpt-3.5-turbo',
          params: {
            temperature,
            maxTokens,
            tone
          },
          promptOrMethod: 'chat_completion',
          rationale: `Used OpenAI ${data.model} with temperature ${temperature} to generate a ${tone} birthday message in ${locale} locale. The prompt included the recipient's name (${firstName}), age (${ageTurning}), and location (${city}, ${country}) to create a personalized message. Total tokens used: ${data.usage?.total_tokens || 'unknown'}.`
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate message with OpenAI: ${error.message}`);
      }
      throw error;
    }
  }
}
