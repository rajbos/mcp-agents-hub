#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output file path
const OUTPUT_FILE = path.join(__dirname, 'mcp_servers_official_list.json');

// Server types constants
const SERVER_TYPES = {
  REFERENCE_SERVER: 'Reference Server',
  OFFICIAL_INTEGRATION: 'Official Integration',
  COMMUNITY_SERVER: 'Community Server',
  FRAMEWORK: 'Framework',
  RESOURCE: 'Resource',
  UNKNOWN: 'Unknown'
};

// Base GitHub repository URL for reference servers
const BASE_GITHUB_REPO = 'https://github.com/modelcontextprotocol/servers';
const BASE_GITHUB_REPO_RAW = 'https://raw.githubusercontent.com/modelcontextprotocol/servers';
const DEFAULT_BRANCH = 'main';

// Define the interface for server info
interface ServerInfo {
  githubUrl: string;
  name?: string;
  type: string;
  description?: string;
}

/**
 * Converts a relative path in the markdown to a full GitHub URL
 * @param relativePath The relative path from the markdown
 * @param isTreePath Whether the path should be converted to a tree path (directory) or blob path (file)
 * @returns The full GitHub URL
 */
function convertToFullGitHubUrl(relativePath: string, isTreePath: boolean = true): string {
  // Remove any leading/trailing whitespace and markdown formatting
  const cleanPath = relativePath.trim().replace(/^\*\*\[.*?\]\((.*?)\)\*\*$/, '$1');
  
  // Check if it's already a full URL
  if (cleanPath.startsWith('http')) {
    return cleanPath;
  }
  
  // Remove any leading slashes
  const normalizedPath = cleanPath.replace(/^\//, '');
  
  // Determine if we should use tree (for directories) or blob (for files)
  // Default to tree for relative paths
  const pathType = isTreePath ? 'tree' : 'blob';
  
  return `${BASE_GITHUB_REPO}/${pathType}/${DEFAULT_BRANCH}/${normalizedPath}`;
}

/**
 * Extracts the name and description from a markdown link
 * @param markdownLink The markdown link text
 * @returns An object with name and description properties
 */
function extractNameAndDescription(markdownLink: string): { name: string, description: string | undefined } {
  // Match format like: **[Name](link)** - Description
  const fullMatch = markdownLink.match(/\*\*\[(.*?)\]\(.*?\)\*\*(?: *- *(.*))?/);
  if (fullMatch) {
    return {
      name: fullMatch[1],
      description: fullMatch[2]
    };
  }
  
  // Match just the name from the link text
  const nameMatch = markdownLink.match(/\[(.*?)\]/);
  return {
    name: nameMatch ? nameMatch[1] : 'Unknown',
    description: undefined
  };
}

// Parse command line arguments
const args = process.argv.slice(2);
let url = '';
let baseRepoUrl = BASE_GITHUB_REPO;
let defaultBranch = DEFAULT_BRANCH;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && i + 1 < args.length) {
    url = args[i + 1];
    break;
  } else if (args[i] === '--repo' && i + 1 < args.length) {
    baseRepoUrl = args[i + 1];
  } else if (args[i] === '--branch' && i + 1 < args.length) {
    defaultBranch = args[i + 1];
  }
}

if (!url) {
  console.error('Error: --url parameter is required');
  console.error('Usage: node mcp_servers_crawler.ts --url <markdown-url> [--repo <base-repo-url>] [--branch <branch-name>]');
  process.exit(1);
}

/**
 * Identifies sections in the markdown content
 * @param content The markdown content
 * @returns A map of section types to their content
 */
function identifySections(content: string): Map<string, string> {
  const sections = new Map<string, string>();
  
  // Match the main sections with more robust patterns
  // The pattern looks for headers followed by content until the next header or end of file
  const referenceServersMatch = content.match(/## [^\n]*Reference Servers[^\n]*\s*\n([\s\S]*?)(?=##|$)/i);
  const thirdPartyMatch = content.match(/## [^\n]*Third-Party Servers[^\n]*\s*\n([\s\S]*?)(?=##|$)/i);
  
  // Within the Third-Party section, extract sub-sections
  let officialIntegrationsMatch = null;
  let communityServersMatch = null;
  
  if (thirdPartyMatch && thirdPartyMatch[1]) {
    officialIntegrationsMatch = thirdPartyMatch[1].match(/### [^\n]*Official Integrations[^\n]*\s*\n([\s\S]*?)(?=###|$)/i);
    communityServersMatch = thirdPartyMatch[1].match(/### [^\n]*Community Servers[^\n]*\s*\n([\s\S]*?)(?=###|$)/i);
  } else {
    // Standalone patterns if the Third-Party section header is formatted differently
    officialIntegrationsMatch = content.match(/### [^\n]*Official Integrations[^\n]*\s*\n([\s\S]*?)(?=###|##|$)/i);
    communityServersMatch = content.match(/### [^\n]*Community Servers[^\n]*\s*\n([\s\S]*?)(?=###|##|$)/i);
  }
  
  // Frameworks and Resources sections
  const frameworksMatch = content.match(/## [^\n]*Frameworks[^\n]*\s*\n([\s\S]*?)(?=##|$)/i);
  const resourcesMatch = content.match(/## [^\n]*Resources[^\n]*\s*\n([\s\S]*?)(?=##|$)/i);
  
  // Add matched sections to the map
  if (referenceServersMatch && referenceServersMatch[1]) {
    sections.set(SERVER_TYPES.REFERENCE_SERVER, referenceServersMatch[1]);
  }
  
  if (officialIntegrationsMatch && officialIntegrationsMatch[1]) {
    sections.set(SERVER_TYPES.OFFICIAL_INTEGRATION, officialIntegrationsMatch[1]);
  }
  
  if (communityServersMatch && communityServersMatch[1]) {
    sections.set(SERVER_TYPES.COMMUNITY_SERVER, communityServersMatch[1]);
  }
  
  if (frameworksMatch && frameworksMatch[1]) {
    // Extract "For servers" and "For clients" subsections from Frameworks
    const forServersMatch = frameworksMatch[1].match(/### [^\n]*For servers[^\n]*\s*\n([\s\S]*?)(?=###|$)/i);
    const forClientsMatch = frameworksMatch[1].match(/### [^\n]*For clients[^\n]*\s*\n([\s\S]*?)(?=###|$)/i);
    
    if (forServersMatch && forServersMatch[1]) {
      sections.set(SERVER_TYPES.FRAMEWORK + " - Servers", forServersMatch[1]);
    }
    
    if (forClientsMatch && forClientsMatch[1]) {
      sections.set(SERVER_TYPES.FRAMEWORK + " - Clients", forClientsMatch[1]);
    }
    
    // Also keep the full section
    sections.set(SERVER_TYPES.FRAMEWORK, frameworksMatch[1]);
  }
  
  if (resourcesMatch && resourcesMatch[1]) {
    sections.set(SERVER_TYPES.RESOURCE, resourcesMatch[1]);
  }
  
  return sections;
}

/**
 * Extracts GitHub URLs from markdown content with their types
 * @param content The markdown content
 * @returns An array of server info objects
 */
function extractGitHubUrlsWithTypes(content: string): ServerInfo[] {
  const sections = identifySections(content);
  const result: ServerInfo[] = [];
  
  // Match GitHub URLs with different patterns
  // 1. Regular GitHub links
  // 2. Links in Markdown format [text](url)
  const githubUrlRegex = /https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+(?:\/[^\s)'"]+)?/g;
  const markdownLinkRegex = /\[.*?\]\((https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+(?:\/[^\s)'"]+)?)\)/g;
  
  // Special regex for reference server links (relative paths)
  const referenceServerLinkRegex = /\*\*\[(.*?)\]\((.*?)\)\*\*(?: *- *(.*?))?(?:\n|$)/g;
  
  // Set to track processed URLs to avoid duplicates
  const processedUrls = new Set<string>();
  
  // Function to normalize GitHub URLs
  const normalizeUrl = (url: string): string => {
    // Remove any trailing slashes
    let normalized = url.replace(/\/+$/, '');
    
    // Remove any query parameters or fragments
    normalized = normalized.split('?')[0].split('#')[0];
    
    // Ensure we only get repository or subfolder URLs (not commits, pull requests, issues, etc.)
    const githubPathPattern = /^https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+(?:\/(?:tree|blob)\/[^\/]+\/.*|\/)?$/;
    if (!githubPathPattern.test(normalized)) {
      // Extract just the repo part for URLs pointing to specific GitHub pages
      const repoMatch = normalized.match(/^(https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+)/);
      if (repoMatch && repoMatch[1]) {
        normalized = repoMatch[1];
      }
    }
    
    return normalized;
  };
  
  // Process each section and extract URLs
  sections.forEach((sectionContent, sectionType) => {
    // Handle reference servers specially - they use relative links
    if (sectionType === SERVER_TYPES.REFERENCE_SERVER) {
      // Extract reference server links using markdown format: **[Name](relative/path)** - Description
      let refMatch;
      while ((refMatch = referenceServerLinkRegex.exec(sectionContent)) !== null) {
        if (refMatch[1] && refMatch[2]) {
          const name = refMatch[1];
          const relativePath = refMatch[2];
          const description = refMatch[3];
          
          // Convert relative path to full GitHub URL
          const fullUrl = convertToFullGitHubUrl(relativePath, true);
          const normalizedUrl = normalizeUrl(fullUrl);
          
          if (normalizedUrl && !processedUrls.has(normalizedUrl)) {
            result.push({
              githubUrl: normalizedUrl,
              name: name,
              description: description,
              type: sectionType
            });
            processedUrls.add(normalizedUrl);
          }
        }
      }
    }
    
    // Extract direct GitHub URLs
    const directMatches = sectionContent.match(githubUrlRegex) || [];
    directMatches.forEach(url => {
      const normalizedUrl = normalizeUrl(url);
      if (normalizedUrl && !processedUrls.has(normalizedUrl)) {
        // Find if this URL is part of a markdown link with description
        const surroundingText = findSurroundingText(sectionContent, url);
        const { name, description } = extractNameAndDescription(surroundingText);
        
        result.push({
          githubUrl: normalizedUrl,
          name,
          description,
          type: sectionType
        });
        processedUrls.add(normalizedUrl);
      }
    });
    
    // Extract URLs from Markdown links
    let match;
    while ((match = markdownLinkRegex.exec(sectionContent)) !== null) {
      if (match[1]) {
        const normalizedUrl = normalizeUrl(match[1]);
        if (normalizedUrl && !processedUrls.has(normalizedUrl)) {
          // Extract name and description from surrounding text
          const surroundingText = findSurroundingText(sectionContent, match[1]);
          const { name, description } = extractNameAndDescription(surroundingText);
          
          result.push({
            githubUrl: normalizedUrl,
            name,
            description,
            type: sectionType
          });
          processedUrls.add(normalizedUrl);
        }
      }
    }
  });
  
  // Process any remaining URLs not in specific sections
  const allUrlsRegex = new RegExp(githubUrlRegex);
  let match;
  while ((match = allUrlsRegex.exec(content)) !== null) {
    const url = match[0];
    const normalizedUrl = normalizeUrl(url);
    if (normalizedUrl && !processedUrls.has(normalizedUrl)) {
      // Try to find surrounding text for context
      const surroundingText = findSurroundingText(content, url);
      const { name, description } = extractNameAndDescription(surroundingText);
      
      result.push({
        githubUrl: normalizedUrl,
        name,
        description,
        type: SERVER_TYPES.UNKNOWN
      });
      processedUrls.add(normalizedUrl);
    }
  }
  
  return result;
}

/**
 * Helper function to find the surrounding text of a URL within content
 * @param content The full content
 * @param url The URL to find
 * @returns The surrounding text (line or list item containing the URL)
 */
function findSurroundingText(content: string, url: string): string {
  // Try to find the line containing the URL
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes(url)) {
      return line;
    }
  }
  
  // If we can't find the exact line, look for list items that might contain the URL
  const listItemRegex = new RegExp(`- .*?${escapeRegExp(url)}.*?(?:\n|$)`, 'g');
  const listItemMatch = listItemRegex.exec(content);
  if (listItemMatch) {
    return listItemMatch[0];
  }
  
  return '';
}

/**
 * Escape special characters in a string for use in a regular expression
 * @param string The string to escape
 * @returns The escaped string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main function to fetch markdown content and extract GitHub URLs with types
 */
async function main() {
  try {
    console.log(`Fetching markdown content from: ${url}`);
    console.log(`Base repository URL: ${BASE_GITHUB_REPO}`);
    console.log(`Default branch: ${DEFAULT_BRANCH}`);
    
    const response = await axios.get(url);
    const markdownContent = response.data;
    
    if (!markdownContent) {
      throw new Error('Failed to fetch markdown content');
    }
    
    console.log('Extracting GitHub URLs from markdown content...');
    const serverInfoList = extractGitHubUrlsWithTypes(markdownContent);
    
    if (serverInfoList.length === 0) {
      console.warn('No GitHub URLs found in the markdown content');
    } else {
      console.log(`Found ${serverInfoList.length} unique GitHub URLs`);
      
      // Count servers by type
      const typeCounts = serverInfoList.reduce((counts, server) => {
        counts[server.type] = (counts[server.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      // Log counts by type
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`- ${type}: ${count}`);
      });
      
      // Log reference servers specifically (with converted URLs)
      const referenceServers = serverInfoList.filter(server => server.type === SERVER_TYPES.REFERENCE_SERVER);
      if (referenceServers.length > 0) {
        console.log(`\nReference Servers (${referenceServers.length}):`);
        referenceServers.forEach(server => {
          console.log(`- ${server.name || 'Unnamed'}: ${server.githubUrl}`);
          if (server.description) {
            console.log(`  Description: ${server.description}`);
          }
        });
      }
    }
    
    // Group servers by type
    const serversByType: Record<string, ServerInfo[]> = {};
    serverInfoList.forEach(server => {
      if (!serversByType[server.type]) {
        serversByType[server.type] = [];
      }
      serversByType[server.type].push(server);
    });
    
    // Create the output object with more detailed structure
    const outputData = {
      metadata: {
        totalServers: serverInfoList.length,
        extractedAt: new Date().toISOString(),
        sourceUrl: url,
        baseRepoUrl: BASE_GITHUB_REPO,
        defaultBranch: DEFAULT_BRANCH,
        typeCounts: Object.fromEntries(
          Object.entries(serversByType).map(([type, servers]) => [type, servers.length])
        )
      },
      servers: serverInfoList
    };
    
    // Write to output file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`\nGitHub URLs with types saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
