/**
 * Translation utilities that use LLM services
 */
import { callLLM } from './llm.js';
import { MCP_SERVER_CATEGORIES } from './mcpCategories.js';

/**
 * Supported languages mapping
 */
export const LANGUAGES: Record<string, string> = {
  'en': 'English',
  'zh-hans': 'Simplified Chinese',
  'zh-hant': 'Traditional Chinese',
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

/**
 * Determine the most appropriate category for an MCP server based on its name and description
 * 
 * @param name - The name of the MCP server
 * @param description - The description of the MCP server
 * @returns The most appropriate category from MCP_SERVER_CATEGORIES
 */
export async function determineCategoryWithLLM(name: string, description: string): Promise<string> {
  // Default to "other-tools" if both name and description are empty
  if (!name && !description) {
    return "other-tools";
  }

  const categoriesString = MCP_SERVER_CATEGORIES.map(cat => `"${cat}"`).join(", ");
  
  const prompt = `Given a Model Context Protocol (MCP) server with the following details:
  
Name: ${name}
Description: ${description}

Please determine the most suitable category for this server from the following categories:
${categoriesString}

Based on the name and description provided, choose exactly one category that best fits this MCP server.
Respond with just the category name, nothing else. If none of the categories clearly fit, choose "other-tools".`;

  const systemMessage = 'You are an expert in categorization for software tools and services. Provide precise category matching.';
  
  try {
    const category = await callLLM(prompt, systemMessage);
    const trimmedCategory = category.trim().replace(/^"|"$/g, ''); // Remove any quotes
    
    // Verify the category is in our list
    if (MCP_SERVER_CATEGORIES.includes(trimmedCategory)) {
      return trimmedCategory;
    } else {
      console.warn(`LLM returned invalid category "${trimmedCategory}". Defaulting to "other-tools".`);
      return "other-tools";
    }
  } catch (error) {
    console.error('Error determining category:', error);
    return "other-tools"; // Default on error
  }
}