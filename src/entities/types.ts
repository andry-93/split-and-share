export interface Event {
    id: string;
    title: string;
    participantIds: string[];
    currency?: string;
    createdAt: number;
}

export interface Participant {
    id: string;
    name: string;
    avatarUri?: string;
}

export interface Expense {
    id: string;
    eventId: string;
    description: string;
    amount: number;
    paidBy: string;
}

export interface Debt {
    from: string;
    to: string;
    amount: number;
}

export type Language = 'en' | 'ru';
export type Theme = 'light' | 'dark';

export type Settings = {
    language: Language;
    theme: Theme;
    defaultCurrency: string;
    locale: string;
    setLanguage: (lang: Language) => Promise<void>;
    setTheme: (theme: Theme) => Promise<void>;
    setDefaultCurrency: (currency: string) => Promise<void>;
};
