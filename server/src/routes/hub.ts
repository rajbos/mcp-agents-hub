import { Router, Request, Response } from 'express';
import { refreshCacheIfNeeded, forceRefreshCache } from '../lib/mcpServers.js';
import { enrichServerData, fetchReadmeContent, extractInfoFromReadme } from '../lib/githubEnrichment.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// GET /servers - returns server data with hubId included
router.get('/servers', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get locale from query parameter, default to 'en'
    const locale = (req.query.locale as string) || 'en';
    
    const mcpServersCache = await refreshCacheIfNeeded(locale);
    
    // Return full data including hubId
    res.json(mcpServersCache);
    console.log(`v1/hub/servers Served full MCP servers data (including hubId) for locale: ${locale} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving hub MCP servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /servers/:hubId - returns a specific server by hubId with enriched data from GitHub README
router.get('/servers/:hubId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hubId } = req.params;
    // Get locale from query parameter, default to 'en'
    const locale = (req.query.locale as string) || 'en';
    
    const mcpServersCache = await refreshCacheIfNeeded(locale);
    
    // Find the server with the matching hubId
    const server = mcpServersCache.find(server => server.hubId === hubId);
    
    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }
    
    // Enrich server data with information from GitHub README
    const enrichedServer = await enrichServerData(server);
    
    res.json(enrichedServer);
    console.log(`v1/hub/servers/${hubId} Served enriched server details for locale: ${locale} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving server details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /servers/submit - submits a new server to be added
router.post('/servers/submit', async (req: Request, res: Response): Promise<void> => {
  try {
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

    // Create a new server object
    const newServer = {
      mcpId,
      githubUrl,
      name: extractedInfo.name,
      author,
      description: extractedInfo.description,
      codiconIcon: "", // Default value, can be updated later
      logoUrl: "",
      category: "tools", // Default category, can be updated later
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
    
  } catch (error) {
    console.error('Error submitting new server:', error);
    res.status(500).json({ error: 'Internal server error while submitting server' });
  }
});

export default router;