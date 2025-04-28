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
  githubStars?: number;
  latest_update_time?: string;
  latest_commit_id?: string;
  fork_count?: number;
  owner_name?: string;
  license_type?: string | null;
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
 * Extract owner and repo from a GitHub URL
 * @param githubUrl The GitHub repository URL
 * @returns An object with owner and repo properties or null if not a valid GitHub URL
 */
export function extractGithubRepoInfo(githubUrl: string): { owner: string; repo: string } | null {
  try {
    // Check if it's a GitHub URL
    if (!githubUrl.startsWith('https://github.com')) {
      return null;
    }

    // Remove trailing slash if present
    const normalizedUrl = githubUrl.endsWith('/') ? githubUrl.slice(0, -1) : githubUrl;
    
    // Extract parts from the URL
    const parts = normalizedUrl.split('/');
    if (parts.length < 5) {
      throw new Error(`Invalid GitHub URL format: ${githubUrl}`);
    }
    
    const owner = parts[3];
    const repo = parts[4];
    
    return { owner, repo };
  } catch (error) {
    console.error(`Error extracting repo info from ${githubUrl}:`, error);
    return null;
  }
}

/**
 * Interface for GitHub repository information
 */
export interface GithubRepoInfo {
  stars_count: number;
  latest_update_time: string; // ISO timestamp of the latest commit
  latest_commit_id: string;
  fork_count: number;
  owner_name: string;
  license_type: string | null; // Will be null if no license information available
}

/**
 * Fetch GitHub repository information including stars, forks, latest update, and license
 * @param githubUrl The GitHub repository URL
 * @returns Repository information or null if not available
 */
export async function fetchGithubInfo(githubUrl: string): Promise<GithubRepoInfo | null> {
  try {
    const repoInfo = extractGithubRepoInfo(githubUrl);
    if (!repoInfo) {
      return null;
    }
    
    const { owner, repo } = repoInfo;
    
    // Use GitHub API to fetch repository information
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
    // URL for fetching the latest commit
    const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
    
    // Use GitHub token from config if available
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (config.github.apiTokenIsValid) {
      headers['Authorization'] = `token ${config.github.apiToken}`;
    }
    
    // Fetch repository data
    const repoResponse = await axios.get(apiUrl, { headers });
    const repoData = repoResponse.data;
    
    // Fetch latest commit data
    const commitsResponse = await axios.get(commitsUrl, { headers });
    const latestCommit = commitsResponse.data[0] || { sha: '', commit: { committer: { date: '' } } };
    
    return {
      stars_count: repoData.stargazers_count,
      latest_update_time: latestCommit.commit?.committer?.date || '',
      latest_commit_id: latestCommit.sha || '',
      fork_count: repoData.forks_count,
      owner_name: repoData.owner?.login || owner,
      license_type: repoData.license?.spdx_id || null
    };
  } catch (error) {
    console.error(`Error fetching repository information for ${githubUrl}:`, error);
    return null;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use fetchGithubInfo instead
 */
export async function fetchGithubStars(githubUrl: string): Promise<number | null> {
  try {
    const repoInfo = await fetchGithubInfo(githubUrl);
    return repoInfo ? repoInfo.stars_count : null;
  } catch (error) {
    console.error(`Error fetching stars for ${githubUrl}:`, error);
    return null;
  }
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

IMPORTANT: 
- ALL text fields in your response MUST be in ${languageName} EXCEPT for the "name" field.
- The "name" field MUST remain in its original form without translation.
- Translate all other extracted information from English to ${languageName} if needed.

Return the information in the following JSON format:
{
    "name": "string", // KEEP THIS IN ORIGINAL LANGUAGE, DO NOT TRANSLATE
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

Remember to keep "name" in its original language, but provide all other fields in ${languageName}.
`;

    const systemMessage = `You are a helpful assistant that extracts structured information from README files and accurately translates it to ${languageName}. Always keep the "name" field in its original language, but translate all other information to ${languageName}.`;
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

    // Fetch GitHub repository information if it's a GitHub URL
    let githubStars: number | undefined = undefined;
    let githubInfo = null;
    if (server.githubUrl.startsWith('https://github.com')) {
      githubInfo = await fetchGithubInfo(server.githubUrl);
      if (githubInfo !== null) {
        githubStars = githubInfo.stars_count;
      }
    }

    // Fetch content using the updated fetchReadmeContent function
    const readmeContent = await fetchReadmeContent(server.githubUrl);
    
    // If no content was retrieved, return the original server data
    if (!readmeContent) {
      console.warn(`No content retrieved from ${server.githubUrl} for server ${server.hubId}`);
      return { ...server, lastEnrichmentTime: Date.now(), githubStars };
    }
    
    // Extract information in the target locale
    const extractedInfo = await extractInfoFromReadme(readmeContent, locale);
    
    // Merge original server data with extracted information
    const enrichedServer: EnrichedMcpServer = {
      ...server,
      ...extractedInfo,
      githubStars,
      lastEnrichmentTime: Date.now(),
    };
    
    // Add GitHub repository information if available
    if (githubInfo) {
      enrichedServer.latest_update_time = githubInfo.latest_update_time;
      enrichedServer.latest_commit_id = githubInfo.latest_commit_id;
      enrichedServer.fork_count = githubInfo.fork_count;
      enrichedServer.owner_name = githubInfo.owner_name;
      enrichedServer.license_type = githubInfo.license_type || undefined;
    }
    
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