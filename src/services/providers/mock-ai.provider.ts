import { AiProvider } from './ai-provider.interface';

const TEMPLATES: any = {
  en: (n: string, city: string, age: number, tone = 'friendly') =>
    tone === 'formal'
      ? `Dear ${n}, warm birthday wishes from ${city}. Congratulations on turning ${age}!`
      : `Happy Birthday, ${n}! 🎉 Sending good vibes from ${city} as you turn ${age}!`,
  ro: (n: string, city: string, age: number, tone = 'friendly') =>
    tone === 'formal'
      ? `Stimate ${n}, vă transmit cele mai sincere urări de ziua dumneavoastră. Felicitări pentru împlinirea vârstei de ${age} ani!`
      : `La mulți ani, ${n}! 🎉 ${city} te sărbătorește la împlinirea a ${age} ani!`,
  it: (n: string, city: string, age: number, tone = 'friendly') =>
    tone === 'formal'
      ? `Gentile ${n}, le porgiamo i nostri più sentiti auguri di buon compleanno. Congratulazioni per i suoi ${age} anni!`
      : `Buon compleanno, ${n}! 🎉 Da ${city}, auguri per i tuoi ${age} anni!`,
  de: (n: string, city: string, age: number, tone = 'friendly') =>
    tone === 'formal'
      ? `Sehr geehrte/r ${n}, herzliche Glückwünsche zu Ihrem ${age}. Geburtstag aus ${city}!`
      : `Alles Gute zum Geburtstag, ${n}! 🎉 ${city} gratuliert dir zum ${age}. Geburtstag!`,
  fr: (n: string, city: string, age: number, tone = 'friendly') =>
    tone === 'formal'
      ? `Cher/Chère ${n}, nos meilleurs vœux d'anniversaire de ${city}. Félicitations pour vos ${age} ans!`
      : `Joyeux anniversaire, ${n}! 🎉 ${city} te souhaite un merveilleux ${age}ème anniversaire!`
};

export const MockAiProvider: AiProvider = {
  async generate({ firstName, city, ageTurning, tone, locale }) {
    const supportedLocales = ['en', 'ro', 'it', 'de', 'fr'];
    const loc = supportedLocales.includes(locale) ? locale : 'en';
    const message = TEMPLATES[loc](firstName, city, ageTurning, tone);
    return {
      message,
      explanation: {
        model: 'MockAiProvider:v1',
        params: { tone: tone || 'friendly', maxTokens: 128, locale: loc },
        promptOrMethod: 'template:short_birthday_v1',
        rationale:
          'Used name, city, and age with tone + locale mapping. Mock mode avoids external calls and keeps output deterministic.'
      }
    };
  }
};
