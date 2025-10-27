
export interface Language {
  name: string;
  code: string;
}

export interface Tone {
  label: string;
  value: string;
}

export interface Model {
  id: string;
  name: string;
}

export interface Voice {
  id: string;
  name: string;
}

export interface TranslationHistoryItem {
    id: number;
    sourceLang: Language;
    targetLang: Language;
    tone: Tone;
    sourceText: string;
    translatedText: string;
}
