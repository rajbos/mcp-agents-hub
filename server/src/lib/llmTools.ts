/**
 * Translation utilities that use LLM services
 */
import { callLLM } from './llm.js';

/**
 * Supported languages mapping
 */
export const LANGUAGES: Record<string, string> = {
  'en': 'English',
  'zhHans': 'Simplified Chinese',
  'zhHant': 'Traditional Chinese',
  'ja': 'Japanese',
  'es': 'Spanish',
  'de': 'German'
};

/**
 * Translate a text to a target language using LLM
 * 
 * @param text - The original text to translate
 * @param language - The target language code (from LANGUAGES keys)
 * @returns The translated text
 */
export async function translateText(text: string, language: string): Promise<string> {
  const prompt = `Translate the following text to ${LANGUAGES[language]}. 
Keep any technical terms, brand names, and code references in their original form.
Do not add any extra quotation marks in your translation that weren't in the original text.
Only return the translated text without any explanations or additional formatting.

Text to translate: ${text}`;

  const systemMessage = 'You are a professional translator. Provide accurate and natural-sounding translations.';
  
  try {
    const translatedText = await callLLM(prompt, systemMessage);
    return translatedText.trim();
  } catch (error) {
    console.error(`Error translating to ${language}:`, error);
    return text; // Return original text on error
  }
}