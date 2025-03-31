import OpenAI from 'openai';
import { config } from './config.js';

// Initialize OpenAI client with configuration
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL,
});

// Validate API key before initializing OpenAI client
if (!config.openai.apiKeyIsValid) {
  console.error('ERROR: OpenAI API key is missing or invalid. Please check your .env file.');
  console.error('LLM functionality will not work without a valid API key.');
}

/**
 * Ensures content is within the model's character limit
 */
export function truncateToModelLimit(content: string, reserveChars: number = 1000): string {
  const charLimit = config.openai.modelCharLimit;
  if (content.length > charLimit) {
    console.warn(`Content exceeds character limit (${content.length}/${charLimit}), truncating...`);
    // Truncate content to leave room for the prompt and other text
    const truncatedContent = content.substring(0, charLimit - reserveChars);
    console.log(`Truncated content to ${truncatedContent.length} characters`);
    return truncatedContent;
  }
  return content;
}

/**
 * Call LLM with a specific prompt and get response
 */
export async function callLLM(
  prompt: string, 
  systemMessage: string = 'You are a helpful assistant.'
): Promise<string> {
  try {
    // Use a default model if none is provided in config
    const modelName = config.openai.modelName || 'gpt-3.5-turbo';

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      model: modelName,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling LLM:', error);
    return '';
  }
}