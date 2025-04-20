import { Router, Request, Response } from 'express';
import { refreshCacheIfNeeded, forceRefreshCache } from '../lib/mcpServers.js';
import { enrichServerData, fetchReadmeContent, extractInfoFromReadme } from '../lib/githubEnrichment.js';
import { MCP_SERVER_CATEGORIES } from '../lib/mcpCategories.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { LANGUAGES, translateText, determineCategoryWithLLM } from '../lib/llmTools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Mapping for locale names to handle both kebab-case and camelCase formats
const localeMapping: Record<string, string> = {
  'zh-hans': 'zhHans',
  'zh-hant': 'zhHant'
};

// Helper function to normalize locale format for server-side processing
function normalizeLocale(locale: string): string {
  // Check if we need to normalize this locale
  if (localeMapping[locale]) {
    console.log(`Normalizing locale ${locale} to directory format ${localeMapping[locale]}`);
    return localeMapping[locale];
  }
  return locale;
}

// Helper function to ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error;
  }
}

// Helper function to translate server data to different languages
async function createLocalizedServerFiles(
  server: any,
  basePath: string,
  filename: string
): Promise<void> {
  // For each language except English (assuming English is the source)
  for (const lang of Object.keys(LANGUAGES)) {
    if (lang === 'en') continue; // Skip English as it's the source language
    
    // Create a copy of the data to modify
    const translatedServer = { ...server };
    
    console.log(`Translating server "${server.name}" to ${LANGUAGES[lang]} (${lang})...`);
    
    // Translate name and description fields using the translateText function
    if (translatedServer.name) {
      translatedServer.name = await translateText(translatedServer.name, lang);
      // Remove any quotation marks that might have been added
      translatedServer.name = translatedServer.name.replace(/^["']|["']$/g, '');
    }
    
    if (translatedServer.description) {
      translatedServer.description = await translateText(translatedServer.description, lang);
      // Remove any quotation marks that might have been added
      translatedServer.description = translatedServer.description.replace(/^["']|["']$/g, '');
    }
    
    // Create language directory if it doesn't exist
    const langDir = path.join(basePath, lang);
    await ensureDirectoryExists(langDir);
    
    // Save translated file to language subdirectory
    const outputFilePath = path.join(langDir, filename);
    await fs.writeFile(outputFilePath, JSON.stringify(translatedServer, null, 2), 'utf8');
    console.log(`Saved translated file to ${outputFilePath}`);
  }
}

// GET /servers - returns server data with hubId included
router.get('/servers', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('api /servers called: req.query.locale = ', req.query.locale);
    // Get locale from query parameter, default to 'en'
    const requestedLocale = (req.query.locale as string) || 'en';
    
    // Keep original format for supported locales check, but pass normalized version for directory structure
    const mcpServersCache = await refreshCacheIfNeeded(requestedLocale);
    
    // Return full data including hubId
    res.json(mcpServersCache);
    console.log(`v1/hub/servers Served full MCP servers data (including hubId) for locale: ${requestedLocale} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving hub MCP servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /search_servers - returns server data filtered by category and locale
router.get('/search_servers', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('api /search_servers called: req.query = ', req.query);
    // Get parameters from query
    const categoryKey = req.query.categoryKey as string;
    const requestedLocale = (req.query.locale as string) || 'en';
    
    // Get servers from cache for the requested locale
    const mcpServersCache = await refreshCacheIfNeeded(requestedLocale);
    
    // Filter by category if categoryKey is provided
    let filteredServers = mcpServersCache;
    if (categoryKey) {
      filteredServers = mcpServersCache.filter(server => server.category === categoryKey);
      console.log(`Filtered servers by category: ${categoryKey}, found ${filteredServers.length} servers`);
    }
    
    // Sort servers so that isRecommended: true servers appear first
    filteredServers.sort((a, b) => {
      // If a is recommended and b is not, a comes first
      if (a.isRecommended && !b.isRecommended) return -1;
      // If b is recommended and a is not, b comes first
      if (!a.isRecommended && b.isRecommended) return 1;
      // If both have the same recommendation status, maintain original order
      return 0;
    });
    
    // Return filtered and sorted data
    res.json(filteredServers);
    console.log(`v1/hub/search_servers Served filtered and sorted MCP servers data (recommended first) for locale: ${requestedLocale}${categoryKey ? `, category: ${categoryKey}` : ''} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving filtered MCP servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /servers/:hubId - returns a specific server by hubId with enriched data from GitHub README
router.get('/servers/:hubId', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('api /servers/:hubId called: req.params.hubId = ', req.params.hubId);
    console.log('api /servers/:hubId called: req.query.locale = ', req.query.locale);
    const { hubId } = req.params;
    // Get locale from query parameter, default to 'en'
    const requestedLocale = (req.query.locale as string) || 'en';
    // Normalize locale for server-side processing
    //const normalizedLocale = normalizeLocale(requestedLocale);
    const normalizedLocale = requestedLocale;
    
    const mcpServersCache = await refreshCacheIfNeeded(normalizedLocale);
    
    // Find the server with the matching hubId
    const server = mcpServersCache.find(server => server.hubId === hubId);
    
    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }
    
    // Enrich server data with information from GitHub README
    // Pass the locale parameter to ensure information is extracted in the right language
    const enrichedServer = await enrichServerData(server, normalizedLocale);
    
    res.json(enrichedServer);
    console.log(`v1/hub/servers/${hubId} Served enriched server details for locale: ${requestedLocale} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving server details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /servers/submit - submits a new server to be added
router.post('/servers/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('api /servers/submit called: req.body = ', req.body);
    const { githubUrl } = req.body;

    if (!githubUrl) {
      res.status(400).json({ error: 'GitHub URL is required' });
      return;
    }

    // Check if URL is a valid GitHub URL
    if (!githubUrl.startsWith('https://github.com/')) {
      res.status(400).json({ error: 'Invalid GitHub URL format. URL must start with https://github.com/' });
      return;
    }

    // Check if this GitHub URL already exists in the server items
    // Use default locale 'en' for checking existence since submission is language-agnostic
    const mcpServersCache = await refreshCacheIfNeeded('en');
    const existingServer = mcpServersCache.find(server => server.githubUrl === githubUrl);
    
    if (existingServer) {
      res.status(409).json({ 
        error: 'Server with this GitHub URL already exists', 
        serverId: existingServer.hubId 
      });
      return;
    }

    // Fetch README content
    const readmeContent = await fetchReadmeContent(githubUrl);
    
    if (!readmeContent) {
      res.status(404).json({ error: 'Failed to fetch README content from GitHub repository' });
      return;
    }

    // Extract info from README
    const extractedInfo = await extractInfoFromReadme(readmeContent);
    
    if (!extractedInfo.name || !extractedInfo.description) {
      res.status(422).json({ error: 'Failed to extract required information from README' });
      return;
    }

    // Parse GitHub URL to get author and repository name
    const urlParts = githubUrl.split('/');
    const author = urlParts[3] || '';
    const repoName = urlParts[4] || '';

    // Generate a new hubId and define mcpId
    const hubId = uuidv4();
    const mcpId = `github.com/${author}/${repoName}`;
    
    // Generate current timestamp in ISO format
    const timestamp = new Date().toISOString();

    // Create tags from description (taking 5 significant words)
    const descriptionWords = extractedInfo.description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 5)
      .slice(0, 5);

    // Determine the appropriate category based on name and description
    const category = await determineCategoryWithLLM(
      extractedInfo.name, 
      extractedInfo.description
    );
    
    console.log(`Determined category for new server: ${category}`);
    
    // Create a new server object
    const newServer = {
      mcpId,
      githubUrl,
      name: extractedInfo.name,
      author,
      description: extractedInfo.description,
      codiconIcon: "", // Default value, can be updated later
      logoUrl: "",
      category, // Dynamically determined category
      tags: descriptionWords,
      requiresApiKey: false,
      isRecommended: false,
      githubStars: 0,
      downloadCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      hubId
    };

    // Save the server data to the split folder
    const splitDirPath = path.join(__dirname, '..', 'data', 'split');
    const sanitizedName = extractedInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const filename = `${hubId}_${sanitizedName}.json`;
    const filePath = path.join(splitDirPath, filename);
    
    await fs.writeFile(filePath, JSON.stringify(newServer, null, 2), 'utf8');
    
    // Force an immediate cache refresh to ensure the new server is visible
    await forceRefreshCache('en');
    
    // Return the created server
    res.status(201).json({
      message: 'Server successfully added',
      server: newServer
    });
    
    // Create localized server files for other languages
    await createLocalizedServerFiles(newServer, splitDirPath, filename);
    
    // Force refresh cache for all other languages
    console.log('Refreshing cache for all supported languages...');
    for (const lang of Object.keys(LANGUAGES)) {
      if (lang === 'en') continue; // Already refreshed English cache
      try {
        await forceRefreshCache(lang);
        console.log(`Cache refreshed for ${LANGUAGES[lang]} (${lang})`);
      } catch (error) {
        console.error(`Error refreshing cache for ${lang}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error submitting new server:', error);
    res.status(500).json({ error: 'Internal server error while submitting server' });
  }
});

// GET /server_categories - returns the list of available server categories
router.get('/server_categories', (req: Request, res: Response): void => {
  try {
    console.log('api /server_categories called');
    res.json(MCP_SERVER_CATEGORIES);
    console.log(`v1/hub/server_categories Served categories at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;