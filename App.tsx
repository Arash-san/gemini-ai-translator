
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Language, Tone, Model, Voice, TranslationHistoryItem } from './types';
import { LANGUAGES, TONES, MODELS, VOICES } from './constants';
import { translateText, generateSpeech } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import TextAreaCard from './components/TextAreaCard';
import { HistoryList } from './components/History';
import { SwapIcon, TranslateIcon } from './components/Icons';

// Audio decoding utilities
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export default function App() {
  const [sourceLang, setSourceLang] = useState<Language>(LANGUAGES.find(l => l.name === 'English')!);
  const [targetLang, setTargetLang] = useState<Language>(LANGUAGES.find(l => l.name === 'Persian')!);
  const [tone, setTone] = useState<Tone>(TONES[1]); // Default to Formal
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [speakingTextType, setSpeakingTextType] = useState<'source' | 'target' | null>(null);
  const [translationHistory, setTranslationHistory] = useState<TranslationHistoryItem[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('translationHistory');
      if (savedHistory) {
        setTranslationHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [translationHistory]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      const result = await translateText(sourceText, sourceLang.name, targetLang.name, tone.value, selectedModel.id);
      setTranslatedText(result);

      const newHistoryItem: TranslationHistoryItem = {
        id: Date.now(),
        sourceLang,
        targetLang,
        tone,
        sourceText,
        translatedText: result,
      };
      setTranslationHistory(prev => [newHistoryItem, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, tone, selectedModel]);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const playAudio = useCallback(async (text: string, type: 'source' | 'target') => {
    if (!text.trim() || speakingTextType) return;

    setSpeakingTextType(type);
    setError(null);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      await audioContext.resume();

      const base64Audio = await generateSpeech(text, selectedVoice.id);
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      source.onended = () => {
        setSpeakingTextType(null);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech.');
      console.error(err);
      setSpeakingTextType(null);
    }
  }, [speakingTextType, selectedVoice]);

  const handleReuseHistoryItem = (item: TranslationHistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setTone(item.tone);
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (id: number) => {
    setTranslationHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setTranslationHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Gemini AI Translator
          </h1>
          <p className="mt-2 text-lg text-gray-400">Translate text and listen with the power of AI.</p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <TextAreaCard
              id="source-text"
              label={sourceLang.name}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              onSpeak={() => playAudio(sourceText, 'source')}
              isSpeaking={speakingTextType === 'source'}
              isReadOnly={false}
            />

            <div className="flex flex-col items-center justify-center space-y-4 md:hidden">
                <button
                    onClick={handleSwapLanguages}
                    className="p-2 rounded-full bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white transition-colors duration-200"
                    aria-label="Swap languages"
                >
                    <SwapIcon className="w-6 h-6 transform rotate-90" />
                </button>
            </div>


            <TextAreaCard
              id="translated-text"
              label={targetLang.name}
              value={isLoading ? 'Translating...' : translatedText}
              placeholder="Translation will appear here"
              onSpeak={() => playAudio(translatedText, 'target')}
              isSpeaking={speakingTextType === 'target'}
              isReadOnly={true}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col xl:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:flex xl:items-center gap-2 sm:gap-4 w-full xl:w-auto flex-wrap justify-center">
              <LanguageSelector
                id="source-lang-selector"
                label="From:"
                selectedLanguage={sourceLang}
                onSelectLanguage={setSourceLang}
              />
              <button
                  onClick={handleSwapLanguages}
                  className="p-2 rounded-full bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white transition-colors duration-200 hidden md:inline-flex"
                  aria-label="Swap languages"
              >
                  <SwapIcon className="w-6 h-6" />
              </button>
              <LanguageSelector
                id="target-lang-selector"
                label="To:"
                selectedLanguage={targetLang}
                onSelectLanguage={setTargetLang}
              />
              <div className="flex items-center gap-2">
                <label htmlFor="tone-selector" className="text-sm font-medium text-gray-400">Tone:</label>
                <select
                  id="tone-selector"
                  value={tone.value}
                  onChange={(e) => setTone(TONES.find(t => t.value === e.target.value)!)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 w-full"
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="model-selector" className="text-sm font-medium text-gray-400">Model:</label>
                <select
                  id="model-selector"
                  value={selectedModel.id}
                  onChange={(e) => setSelectedModel(MODELS.find(m => m.id === e.target.value)!)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 w-full"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="voice-selector" className="text-sm font-medium text-gray-400">Voice:</label>
                <select
                  id="voice-selector"
                  value={selectedVoice.id}
                  onChange={(e) => setSelectedVoice(VOICES.find(v => v.id === e.target.value)!)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 w-full"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
            >
              <TranslateIcon className="w-5 h-5" />
              <span>{isLoading ? 'Translating...' : 'Translate'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 text-center p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          <HistoryList 
            history={translationHistory}
            onReuseItem={handleReuseHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
          />
        </main>
      </div>
    </div>
  );
}
