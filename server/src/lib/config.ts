import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import fs from 'fs';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '..', '.env');

// Force reload the environment variables
dotenv.config({ path: envPath });

// Check if .env file exists and has content
let envFileContent = '';
try {
  if (fs.existsSync(envPath)) {
    envFileContent = fs.readFileSync(envPath, 'utf8');
    console.log('Found .env file with content length:', envFileContent.length);
    
    // Print first few chars of API key for debugging (careful with sensitive data)
    const apiKeyLine = envFileContent.split('\n').find(line => line.startsWith('OPENAI_API_KEY='));
    if (apiKeyLine) {
      const apiKeyValue = apiKeyLine.split('=')[1];
      console.log(`API key in .env: ${apiKeyValue ? `defined (${apiKeyValue.substring(0, 3)}...)` : 'empty'}`);
    } else {
      console.log('OPENAI_API_KEY not found in .env file');
    }
    
    // Also check OPENAI_BASE_URL
    const baseUrlLine = envFileContent.split('\n').find(line => line.startsWith('OPENAI_BASE_URL='));
    if (baseUrlLine) {
      const baseUrlValue = baseUrlLine.split('=')[1];
      console.log(`OPENAI_BASE_URL in .env: ${baseUrlValue || 'empty'}`);
    } else {
      console.log('OPENAI_BASE_URL not found in .env file');
    }
  } else {
    console.log('.env file not found at:', envPath);
  }
} catch (error) {
  console.error('Error reading .env file:', error);
}

// Raw environment variable check
const rawApiKey = process.env.OPENAI_API_KEY;
console.log('Raw API Key from process.env:', rawApiKey ? `exists (${rawApiKey.substring(0, 3)}...)` : 'undefined or empty');
console.log('Raw OPENAI_BASE_URL from process.env:', process.env.OPENAI_BASE_URL || 'undefined or empty');

// Ensure base URL is valid and has a protocol
function ensureValidBaseUrl(url: string | undefined): string {
  // Default URL if none provided
  const defaultUrl = 'https://ark.cn-beijing.volces.com/api/v3';
  
  if (!url || url.trim() === '') {
    console.log('Using default OPENAI_BASE_URL:', defaultUrl);
    return defaultUrl;
  }
  
  try {
    // Remove any trailing slashes
    let cleanUrl = url.trim().replace(/\/+$/, '');
    
    // Check if URL has a protocol, if not add https://
    if (!cleanUrl.match(/^https?:\/\//i)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    // Validate URL by creating a URL object
    new URL(cleanUrl);
    
    console.log('Using OPENAI_BASE_URL:', cleanUrl);
    return cleanUrl;
  } catch (error) {
    console.error('Invalid OPENAI_BASE_URL format, using default:', defaultUrl);
    return defaultUrl;
  }
}

// API configuration with validation
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    apiKeyIsValid: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''),
    baseURL: ensureValidBaseUrl(process.env.OPENAI_BASE_URL),
    modelName: process.env.MODEL_NAME,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600000', 10), // Default to 1 hour
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  }
};

// Print configuration for debugging (excluding sensitive data)
console.log('Configuration loaded:');
console.log(`- API Key defined: ${config.openai.apiKeyIsValid}`);
console.log(`- API Base URL: ${config.openai.baseURL}`);
console.log(`- Model Name: ${config.openai.modelName}`);
console.log(`- Cache TTL: ${config.cache.ttl} ms`);
console.log(`- Server Port: ${config.server.port}`);

// For debugging, print where the .env file was loaded from
console.log(`Loading environment from: ${envPath}`);