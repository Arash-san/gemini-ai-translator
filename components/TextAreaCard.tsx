
import React, { useState } from 'react';
import { SoundIcon, SoundLoadingIcon, CopyIcon, CheckIcon } from './Icons';

interface TextAreaCardProps {
  id: string;
  label: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  onSpeak: () => void;
  isSpeaking: boolean;
  isReadOnly: boolean;
  isLoading?: boolean;
}

const TextAreaCard: React.FC<TextAreaCardProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  onSpeak,
  isSpeaking,
  isReadOnly,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <div className="px-4 py-2 border-b border-gray-700">
        <label htmlFor={id} className="text-sm font-semibold text-gray-300">
          {label}
        </label>
      </div>
      <div className="relative flex-grow">
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={isReadOnly}
          className={`w-full h-64 p-4 bg-transparent text-gray-200 resize-none focus:outline-none placeholder-gray-500 ${isReadOnly ? 'cursor-default' : ''}`}
        />
        {isLoading && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
            </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onSpeak}
            disabled={isSpeaking || !value}
            className="p-2 text-gray-400 hover:text-indigo-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Listen to text"
          >
            {isSpeaking ? <SoundLoadingIcon className="w-6 h-6" /> : <SoundIcon className="w-6 h-6" />}
          </button>
          <button
            onClick={handleCopy}
            disabled={!value}
            className="p-2 text-gray-400 hover:text-indigo-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Copy text"
          >
            {copied ? <CheckIcon className="w-6 h-6 text-green-400" /> : <CopyIcon className="w-6 h-6" />}
          </button>
        </div>
        <span className="text-sm text-gray-500">
          {value.length} characters
        </span>
      </div>
    </div>
  );
};

export default TextAreaCard;
