
import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  id: string;
  label: string;
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ id, label, selectedLanguage, onSelectLanguage }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = LANGUAGES.find(lang => lang.name === event.target.value);
    if (selected) {
      onSelectLanguage(selected);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-400">{label}</label>
      <select
        id={id}
        value={selectedLanguage.name}
        onChange={handleChange}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.name}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
