import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the interface for an MCP server
export interface McpServer {
  mcpId: string;
  githubUrl?: string;
  name: string;
  author: string;
  description: string;
  codiconIcon?: string;
  logoUrl?: string;
  category?: string;
  tags?: string[];
  requiresApiKey?: boolean;
  isRecommended?: boolean;
  githubStars?: number;
  downloadCount?: number;
  createdAt?: string;
  updatedAt?: string;
  hubId: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

// In-memory cache for MCP servers data - now keyed by locale
const mcpServersCache: Record<string, McpServer[]> = {};
const lastCacheUpdate: Record<string, number> = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'de', 'es', 'ja', 'zhHans', 'zhHant'];

/**
 * Loads all MCP server data from split files and combines them
 * @param locale The locale to load data for (default: 'en')
 */
export async function loadMcpServersData(locale: string = DEFAULT_LOCALE): Promise<McpServer[]> {
  try {
    // Use the default locale if the requested one is not supported
    if (!SUPPORTED_LOCALES.includes(locale)) {
      console.warn(`Locale ${locale} is not supported. Using default locale ${DEFAULT_LOCALE} instead.`);
      locale = DEFAULT_LOCALE;
    }

    // Determine the directory to load files from
    const baseDir = join(__dirname, '..', 'data', 'split');
    // For English, use the root directory; for other locales, use the locale-specific subdirectory
    let dirPath = locale === DEFAULT_LOCALE ? baseDir : join(baseDir, locale);
    
    // Check if the directory exists
    try {
      await fs.access(dirPath);
    } catch {
      console.warn(`Directory for locale ${locale} does not exist. Falling back to default locale.`);
      locale = DEFAULT_LOCALE;
      // Use the base directory for the default locale
      dirPath = baseDir;
    }
    
    const files = await fs.readdir(dirPath);
    
    const serversData: McpServer[] = [];
    
    // Process each file in the directory
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = join(dirPath, file);
          const fileContent = await fs.readFile(filePath, 'utf8');
          const serverData = JSON.parse(fileContent) as McpServer;
          serversData.push(serverData);
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
          // Continue with other files even if one fails
        }
      }
    }
    
    return serversData;
  } catch (error) {
    console.error(`Error loading MCP servers data for locale ${locale}:`, error);
    return [];
  }
}

/**
 * Returns a clean version of the MCP servers data with hubId removed
 */
export function getCleanedServersData(serversData: McpServer[]): Omit<McpServer, 'hubId'>[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return serversData.map(({ hubId, ...cleanedServer }) => cleanedServer);
}

/**
 * Refreshes the cache if TTL has expired for the specified locale
 * @param locale The locale to refresh cache for (default: 'en')
 */
export async function refreshCacheIfNeeded(locale: string = DEFAULT_LOCALE): Promise<McpServer[]> {
  const now = Date.now();
  // If the locale doesn't have a cache entry or the cache is expired
  if (!mcpServersCache[locale] || !lastCacheUpdate[locale] || now - lastCacheUpdate[locale] > CACHE_TTL) {
    mcpServersCache[locale] = await loadMcpServersData(locale);
    lastCacheUpdate[locale] = now;
    console.log(`MCP servers cache refreshed for locale ${locale} at ${new Date().toISOString()}`);
  }
  return mcpServersCache[locale];
}

/**
 * Force a refresh of the cache for the specified locale regardless of TTL
 * Use this when new data has been added to ensure immediate visibility
 * @param locale The locale to force refresh (default: 'en')
 */
export async function forceRefreshCache(locale: string = DEFAULT_LOCALE): Promise<McpServer[]> {
  mcpServersCache[locale] = await loadMcpServersData(locale);
  lastCacheUpdate[locale] = Date.now();
  console.log(`MCP servers cache force-refreshed for locale ${locale} at ${new Date().toISOString()}`);
  return mcpServersCache[locale];
}

// Initialize the cache for default locale on startup
refreshCacheIfNeeded().catch(err => {
  console.error('Failed to initialize MCP servers cache:', err);
});