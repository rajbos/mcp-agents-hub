#!/usr/bin/env tsx

// A script to update the "category" field of JSON files in the split directory
// based on the "description" field, ensuring the category is one of the valid MCP_SERVER_CATEGORIES

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MCP_SERVER_CATEGORIES } from '../lib/mcpCategories.js';
import { determineCategoryWithLLM } from '../lib/llmTools.js';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory paths
const SPLIT_DIR = path.join(__dirname, 'split');
const LOG_FILE = path.join(__dirname, 'process_categories.log.json');

// Languages to process (based on the reference script)
const LANGUAGES = ['zh-hans', 'zh-hant', 'ja', 'es', 'de'];

// Structure for tracking processed files
interface ProcessedLog {
  lastProcessed: string; // Timestamp of last run
  processedFiles: string[]; // Array of processed hubIds (filenames without .json)
}

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to load the log file or create it if it doesn't exist
function loadProcessedLog(): ProcessedLog {
  if (fs.existsSync(LOG_FILE)) {
    try {
      const logContent = fs.readFileSync(LOG_FILE, 'utf8');
      return JSON.parse(logContent) as ProcessedLog;
    } catch (error) {
      console.warn(`Error reading log file, creating a new one: ${error}`);
    }
  }
  
  // Return default empty log if file doesn't exist or has errors
  return {
    lastProcessed: new Date().toISOString(),
    processedFiles: []
  };
}

// Function to save the updated log
function saveProcessedLog(log: ProcessedLog): void {
  log.lastProcessed = new Date().toISOString();
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
  console.log(`Updated process log at ${LOG_FILE}`);
}

// Add graceful shutdown handler to save progress on interruption
function setupShutdownHandlers(log: ProcessedLog): void {
  const saveAndExit = () => {
    console.log('\nProcess interrupted. Saving current progress...');
    saveProcessedLog(log);
    console.log('Progress saved. Exiting.');
    process.exit(0);
  };

  // Handle common termination signals
  process.on('SIGINT', saveAndExit);  // Ctrl+C
  process.on('SIGTERM', saveAndExit); // kill command
  process.on('SIGHUP', saveAndExit);  // Terminal closed
}

// Get hubId from filename
function getHubIdFromFilename(filename: string): string {
  return filename.replace('.json', '');
}

// Function to determine the most appropriate category based on description
function determineCategory(description: string): string {
  if (!description) {
    return "other-tools";
  }

  // Convert description to lowercase for case-insensitive matching
  const lowerDescription = description.toLowerCase();
  
  // Create a mapping of categories to related keywords
  const categoryKeywords: Record<string, string[]> = {
    "browser-automation": ["browser", "web", "automation", "chrome", "firefox", "selenium", "puppeteer", "playwright"],
    "cloud-platforms": ["cloud", "aws", "azure", "gcp", "google cloud", "s3", "ec2", "lambda"],
    "communication": ["message", "email", "chat", "communication", "slack", "discord", "teams", "notification"],
    "databases": ["database", "sql", "nosql", "mongodb", "postgres", "mysql", "redis", "data storage"],
    "file-systems": ["file", "storage", "directory", "filesystem", "s3", "blob"],
    "knowledge-memory": ["knowledge", "memory", "information", "retrieval", "rag", "vector", "embedding"],
    "location-services": ["location", "map", "gps", "geolocation", "position", "places", "navigation"],
    "monitoring": ["monitor", "logging", "log", "trace", "metrics", "observability", "health"],
    "search": ["search", "find", "query", "lookup", "index", "elasticsearch"],
    "version-control": ["git", "svn", "version control", "repository", "commit", "branch", "merge"],
    "integrations": ["integration", "connect", "middleware", "api", "connection", "bridge"],
    "developer-tools": ["developer", "development", "code", "programming", "ide", "editor", "build", "compile"]
  };
  
  // Score each category based on keyword matches in description
  const scores: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        scores[category]++;
      }
    }
  }
  
  // Find category with highest score
  let bestCategory = "other-tools";
  let highestScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }
  
  // If we have a match with at least one keyword, use it
  if (highestScore > 0) {
    return bestCategory;
  }
  
  return "other-tools";
}

// Function to update category in a file
function updateCategoryInFile(filePath: string, category: string): void {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  
  // Store the original category for logging
  const originalCategory = data.category;
  
  // Update the category
  data.category = category;
  
  // Save the updated file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  
  return originalCategory;
}

// Main function to process all JSON files in the split directory
async function processAllFiles(): Promise<void> {
  console.log('Starting category update process...');
  console.log(`Looking for JSON files in: ${SPLIT_DIR}`);
  
  // Load processed log
  const processedLog = loadProcessedLog();
  console.log(`Loaded processing log. Last run: ${processedLog.lastProcessed}`);
  console.log(`Previously processed ${processedLog.processedFiles.length} files`);
  
  // Setup handlers to save progress on interruption
  setupShutdownHandlers(processedLog);
  
  // Get all JSON files from split directory (only in the root, not in language subdirectories)
  const allFiles = fs.readdirSync(SPLIT_DIR)
    .filter(file => file.endsWith('.json') && fs.statSync(path.join(SPLIT_DIR, file)).isFile());
    
  console.log(`Found ${allFiles.length} total JSON files in root directory`);
  
  // Filter out already processed files
  const filesToProcess = allFiles.filter(file => {
    const hubId = getHubIdFromFilename(file);
    return !processedLog.processedFiles.includes(hubId);
  });
  
  console.log(`${filesToProcess.length} new files to process (${allFiles.length - filesToProcess.length} skipped)`);
  
  if (filesToProcess.length === 0) {
    console.log('No new files to process. Exiting.');
    return;
  }
  
  // Process each file
  for (const [index, file] of filesToProcess.entries()) {
    try {
      const hubId = getHubIdFromFilename(file);
      console.log(`Processing file ${index + 1}/${filesToProcess.length}: ${file} (hubId: ${hubId})`);
      const filePath = path.join(SPLIT_DIR, file);
      
      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Get name and description for category determination
      const name = data.name || '';
      const description = data.description || '';
      console.log(`  Name: "${name}"`);
      console.log(`  Description: "${description.substring(0, 50)}${description.length > 50 ? '...' : ''}"`);
      
      // First try to determine category using LLM
      let category: string;
      try {
        category = await determineCategoryWithLLM(name, description);
        console.log(`  LLM suggested category: "${category}"`);
      } catch (error) {
        console.warn(`  Error using LLM for category: ${error}`);
        // Fall back to keyword-based determination if LLM fails
        category = determineCategory(description);
        console.log(`  Fallback to keyword matching: "${category}"`);
      }
      
      // Update the category in the main file
      const originalCategory = updateCategoryInFile(filePath, category);
      console.log(`  Updated category from "${originalCategory}" to "${category}"`);
      
      // Update the category in each language subdirectory if the file exists
      for (const lang of LANGUAGES) {
        const langDir = path.join(SPLIT_DIR, lang);
        const langFilePath = path.join(langDir, file);
        
        if (fs.existsSync(langFilePath)) {
          updateCategoryInFile(langFilePath, category);
          console.log(`  Updated category in ${lang}/${file}`);
        }
      }
      
      // Add the successfully processed file to our log
      processedLog.processedFiles.push(hubId);
      
      // Save the log after each file to ensure we don't lose progress on interruption
      saveProcessedLog(processedLog);
      
      console.log(`  Completed category updates for ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  // Final save of the processing log
  saveProcessedLog(processedLog);
  console.log('Category update process completed!');
}

// Execute the main function
processAllFiles().catch(error => {
  console.error('An error occurred during processing:', error);
  process.exit(1);
});
