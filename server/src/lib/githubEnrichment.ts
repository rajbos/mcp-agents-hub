import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { McpServer } from './mcpServers.js';
import { config } from './config.js';
import { callLLM, truncateToModelLimit } from './llm.js';
import { LANGUAGES, translateText } from './llmTools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache directory path
const CACHE_DIR = path.join(__dirname, '..', 'data', 'cached');
const CACHE_TTL = config.cache.ttl;

// Interface for structured information extracted from README
export interface ReadmeExtractedInfo {
  name: string;
  description: string;
  Installation_instructions: string;
  Usage_instructions: string;
  features: string[];
  prerequisites: string[];
}

// Extended server interface with additional fields from README
export interface EnrichedMcpServer extends McpServer {
  Installation_instructions?: string;
  Usage_instructions?: string;
  features?: string[];
  prerequisites?: string[];
  lastEnrichmentTime?: number;
}

/**
 * Convert GitHub URL to raw README.md URL
 * Handles both repository root URLs and subfolder URLs
 */
export function convertToRawReadmeUrl(githubUrl: string): string {
  // Remove trailing slash if present
  const normalizedUrl = githubUrl.endsWith('/') ? githubUrl.slice(0, -1) : githubUrl;
  
  // Extract parts from the URL
  const parts = normalizedUrl.split('/');
  if (parts.length < 5) {
    throw new Error(`Invalid GitHub URL format: ${githubUrl}`);
  }
  
  const owner = parts[3];
  const repo = parts[4];
  let subfolderPath = '';
  
  // Check if the URL points to a subfolder (tree/branch/path structure)
  if (parts.length > 5 && parts[5] === 'tree') {
    const branch = parts[6]; // Usually 'main' or 'master'
    
    // Collect all path segments after the branch
    if (parts.length > 7) {
      subfolderPath = parts.slice(7).join('/') + '/';
    }
    
    // Construct raw URL with the subfolder path
    return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${subfolderPath}README.md`;
  }
  
  // Default case: repository root
  return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/README.md`;
}

/**
 * Fetch content from GitHub README or any other URL
 */
export async function fetchReadmeContent(url: string): Promise<string> {
  try {
    // Check if it's a GitHub URL
    if (url.startsWith('https://github.com')) {
      // Process as GitHub repository
      const rawReadmeUrl = convertToRawReadmeUrl(url);
      const response = await axios.get(rawReadmeUrl);
      return response.data;
    } else {
      // Try to fetch content from the URL directly
      const response = await axios.get(url);
      console.log(`Successfully fetched content from ${url}`);
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return '';
  }
}

/**
 * Call LLM to extract structured information from README content
 */
export async function callLLMForReadmeExtraction(content: string, locale: string = 'en'): Promise<ReadmeExtractedInfo> {
  try {
    const languageName = LANGUAGES[locale] || 'English';
    
    const prompt = `Extract structured information from the provided README.md content and provide the response in ${languageName}.

IMPORTANT: ALL text fields in your response MUST be in ${languageName}. Translate all extracted information from English to ${languageName} if needed.

Return the information in the following JSON format:
{
    "name": "string",
    "description": "string",
    "Installation_instructions": "string",
    "Usage_instructions": "string",
    "features": [
        "string"
    ],
    "prerequisites": [
        "string"
    ]
}

README.md content:
${content}

Remember to provide ALL fields in ${languageName} only.
`;

    const systemMessage = `You are a helpful assistant that extracts structured information from README files and accurately translates it to ${languageName}. Always return the information in ${languageName} regardless of the source language.`;
    const responseContent = await callLLM(prompt, systemMessage);
    
    // Extract JSON from the response
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }
    
    // Parse the JSON response
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error calling LLM for README extraction:', error);
    return {
      name: '',
      description: '',
      Installation_instructions: '',
      Usage_instructions: '',
      features: [],
      prerequisites: []
    };
  }
}

/**
 * Extract structured information from README using OpenAI
 * @param readmeContent The README content to extract information from
 * @param locale The target locale for extracted information (default: 'en')
 */
export async function extractInfoFromReadme(readmeContent: string, locale: string = 'en'): Promise<ReadmeExtractedInfo> {
  try {
    if (!readmeContent) {
      throw new Error('README content is empty');
    }

    // Use the truncateToModelLimit function from llm.ts
    const processedContent = truncateToModelLimit(readmeContent);

    // Call the LLM extraction function with the processed content and locale
    return await callLLMForReadmeExtraction(processedContent, locale);
  } catch (error) {
    console.error('Error extracting information from README:', error);
    return {
      name: '',
      description: '',
      Installation_instructions: '',
      Usage_instructions: '',
      features: [],
      prerequisites: []
    };
  }
}

/**
 * Initialize cache directory
 */
export async function initializeCacheDirectory(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log(`Cache directory initialized at ${CACHE_DIR}`);
  } catch (error) {
    console.error('Error initializing cache directory:', error);
  }
}

/**
 * Get cached server data if available and not expired
 */
export async function getCachedServerData(hubId: string): Promise<EnrichedMcpServer | null> {
  try {
    const cachePath = path.join(CACHE_DIR, `${hubId}.json`);
    const stats = await fs.stat(cachePath);
    const fileContent = await fs.readFile(cachePath, 'utf8');
    const cachedData = JSON.parse(fileContent) as EnrichedMcpServer;
    
    // Check if cache is still valid
    const now = Date.now();
    if (cachedData.lastEnrichmentTime && (now - cachedData.lastEnrichmentTime <= CACHE_TTL)) {
      return cachedData;
    }
    
    return null; // Cache expired
  } catch (error) {
    return null; // Cache doesn't exist or error reading it
  }
}

/**
 * Save enriched server data to cache
 */
export async function cacheServerData(serverData: EnrichedMcpServer): Promise<void> {
  try {
    const cachePath = path.join(CACHE_DIR, `${serverData.hubId}.json`);
    await fs.writeFile(cachePath, JSON.stringify(serverData, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error caching server data for ${serverData.hubId}:`, error);
  }
}

/**
 * Enrich server data with information from GitHub README or other public URLs
 * @param server The MCP server to enrich
 * @param locale The target locale for extracted information (default: 'en')
 */
export async function enrichServerData(server: McpServer, locale: string = 'en'): Promise<EnrichedMcpServer> {
  try {
    // Check cache first - locale-specific cache key
    const cacheKey = `${server.hubId}_${locale}`;
    const cachedData = await getCachedServerData(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for server ${server.hubId} in locale ${locale}`);
      return cachedData;
    }
    
    // If no cache or expired, fetch and process content
    if (!server.githubUrl) {
      throw new Error(`No GitHub or documentation URL available for server ${server.hubId}`);
    }

    // Fetch content using the updated fetchReadmeContent function
    // which handles both GitHub and regular URLs
    const readmeContent = await fetchReadmeContent(server.githubUrl);
    
    // If no content was retrieved, return the original server data
    if (!readmeContent) {
      console.warn(`No content retrieved from ${server.githubUrl} for server ${server.hubId}`);
      return { ...server, lastEnrichmentTime: Date.now() };
    }
    
    // Extract information in the target locale
    const extractedInfo = await extractInfoFromReadme(readmeContent, locale);
    
    // Merge original server data with extracted information
    const enrichedServer: EnrichedMcpServer = {
      ...server,
      ...extractedInfo,
      lastEnrichmentTime: Date.now(),
    };
    
    // Cache the enriched data using locale-specific key
    enrichedServer.hubId = cacheKey; // Temporarily modify hubId for caching
    await cacheServerData(enrichedServer);
    enrichedServer.hubId = server.hubId; // Restore original hubId
    
    return enrichedServer;
  } catch (error) {
    console.error(`Error enriching server data for ${server.hubId} in locale ${locale}:`, error);
    return { ...server, lastEnrichmentTime: Date.now() };
  }
}

// Initialize cache directory on startup
initializeCacheDirectory().catch(err => {
  console.error('Failed to initialize cache directory:', err);
});