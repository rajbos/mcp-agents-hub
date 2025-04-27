import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface OfficialServer {
  githubUrl: string;
  name: string;
  description: string;
  type: string;
}

interface OfficialList {
  metadata: {
    totalServers: number;
    extractedAt: string;
    sourceUrl: string;
    baseRepoUrl: string;
    defaultBranch: string;
    typeCounts: Record<string, number>;
  };
  servers: OfficialServer[];
}

interface SplitFile {
  mcpId: string;
  githubUrl: string;
  name: string;
  description: string;
  codiconIcon: string;
  logoUrl: string;
  category: string;
  tags: string[];
  requiresApiKey: boolean;
  isRecommended: boolean;
  githubStars: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  hubId: string;
  isOfficialIntegration: boolean;
  isReferenceServer: boolean;
  isCommunityServer: boolean;
}

function formatGithubUrlToMcpId(url: string): string {
  return url.replace('https://', '');
}

function cleanDescription(description: string): string {
  // If description is undefined or null, return an empty string
  if (!description) {
    return '';
  }
  
  // Remove emojis - this regex pattern targets most emoji characters
  const emojiPattern = /[\p{Emoji_Presentation}\p{Emoji}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/gu;
  description = description.replace(emojiPattern, '');
  
  // Trim any extra spaces that might have been left after removing emojis
  description = description.replace(/\s+/g, ' ').trim();
  
  return description;
}

function isValidServerType(type: string): boolean {
  return type === 'Community Server' || type === 'Official Integration' || type === 'Reference Server';
}

function main() {
  // Initialize counters for summary
  let totalFiles = 0;
  let updatedFiles = 0;
  let errorFiles = 0;
  let createdFiles = 0;
  let skippedFiles = 0;
  
  // Get the current file's URL
  const currentFileUrl = import.meta.url;
  // Convert the URL to a path
  const currentFilePath = new URL(currentFileUrl).pathname;
  // Get the directory name
  const dataDir = path.dirname(currentFilePath);
  const splitDir = path.join(dataDir, 'split');
  const officialListPath = path.join(dataDir, 'mcp_servers_official_list.json');

  // Ensure split directory exists
  if (!fs.existsSync(splitDir)) {
    fs.mkdirSync(splitDir, { recursive: true });
  }

  // Read official list
  const officialListContent = fs.readFileSync(officialListPath, 'utf8');
  const officialList: OfficialList = JSON.parse(officialListContent);
  const serversMap = new Map<string, OfficialServer>();
  
  // Create a map of servers by githubUrl for easy lookup, only including valid types
  officialList.servers.forEach(server => {
    if (isValidServerType(server.type)) {
      serversMap.set(server.githubUrl, server);
    } else {
      skippedFiles++;
      console.log(`Skipping server with invalid type: ${server.name || 'unnamed'} (${server.type})`);
    }
  });

  // Get all existing split files
  const existingFiles = fs.readdirSync(splitDir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(splitDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData: SplitFile = JSON.parse(content);
      totalFiles++;
      return { file, jsonData };
    });

  const existingGithubUrls = new Set<string>();

  // Update existing files
  existingFiles.forEach(({ file, jsonData }) => {
    const filePath = path.join(splitDir, file);
    const githubUrl = jsonData.githubUrl;
    existingGithubUrls.add(githubUrl);
    
    // Format mcpId from githubUrl (remove "https://")
    jsonData.mcpId = formatGithubUrlToMcpId(githubUrl);

    const officialServer = serversMap.get(githubUrl);
    if (officialServer) {
      // Update the server info based on official list
      jsonData.isOfficialIntegration = officialServer.type === 'Official Integration';
      jsonData.isReferenceServer = officialServer.type === 'Reference Server';
      jsonData.isCommunityServer = officialServer.type === 'Community Server';
      
      // Also update and clean the description from the official list
      if (officialServer.description) {
        jsonData.description = cleanDescription(officialServer.description);
      }
    } else {
      // If not in the official list, set as community server
      jsonData.isOfficialIntegration = false;
      jsonData.isReferenceServer = false;
      jsonData.isCommunityServer = true;
      
      // Clean existing description
      if (jsonData.description) {
        jsonData.description = cleanDescription(jsonData.description);
      }
    }

    // Write the updated file back
    try {
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log(`Updated file: ${file}`);
      updatedFiles++;
    } catch (error: any) {
      console.error(`Error updating file ${file}: ${error.message}`);
      errorFiles++;
    }
  });

  // Create new files for servers in the official list that don't exist in split directory
  const now = new Date().toISOString();
  officialList.servers.forEach(server => {
    if (!existingGithubUrls.has(server.githubUrl)) {
      const hubId = uuidv4();
      const fileName = `${hubId}_${server.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.json`;
      const filePath = path.join(splitDir, fileName);

      const newServer: SplitFile = {
        mcpId: formatGithubUrlToMcpId(server.githubUrl),
        githubUrl: server.githubUrl,
        name: server.name,
        description: cleanDescription(server.description),
        codiconIcon: '',
        logoUrl: '',
        category: '',
        tags: [],
        requiresApiKey: false,
        isRecommended: false,
        githubStars: 0,
        downloadCount: 0,
        createdAt: now,
        updatedAt: now,
        hubId,
        isOfficialIntegration: server.type === 'Official Integration',
        isReferenceServer: server.type === 'Reference Server',
        isCommunityServer: server.type === 'Community Server'
      };

      try {
        fs.writeFileSync(filePath, JSON.stringify(newServer, null, 2), 'utf8');
        console.log(`Created new file: ${fileName}`);
        createdFiles++;
      } catch (error: any) {
        console.error(`Error creating file ${fileName}: ${error.message}`);
        errorFiles++;
      }
    }
  });

  // Display summary
  console.log('\n========== SUMMARY ==========');
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files updated: ${updatedFiles}`);
  console.log(`New files created: ${createdFiles}`);
  console.log(`Files with errors: ${errorFiles}`);
  console.log(`Servers skipped (invalid type): ${skippedFiles}`);
  console.log('=============================');
  
  if (errorFiles > 0) {
    console.log('Update completed with some errors');
  } else {
    console.log('Update completed successfully');
  }
}

main();
