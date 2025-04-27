#!/usr/bin/env tsx

// A script to remove duplicate JSON files in the split directory
// based on the "githubUrl" field

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory paths
const SPLIT_DIR = path.join(__dirname, 'split');
const LOG_FILE = path.join(__dirname, 'clean_duplicate.log.json');

// Languages to process (based on the reference script)
const LANGUAGES = ['zh-hans', 'zh-hant', 'ja', 'es', 'de'];

// Structure for tracking processed files
interface ProcessedLog {
  lastProcessed: string; // Timestamp of last run
  removedFiles: string[]; // Array of removed duplicate files
  keptFiles: string[]; // Array of kept files (the "originals")
}

// Structure for the server data files
interface ServerData {
  githubUrl: string;
  mcpId?: string;
  name?: string;
  description?: string;
  category?: string;
  [key: string]: any; // Allow for other properties
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
    removedFiles: [],
    keptFiles: []
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

// Function to delete a file and all its language variants
function deleteFileAndLanguageVariants(basePath: string, filename: string): void {
  // Delete the main file
  const mainFilePath = path.join(SPLIT_DIR, filename);
  if (fs.existsSync(mainFilePath)) {
    fs.unlinkSync(mainFilePath);
    console.log(`  Deleted main file: ${filename}`);
  }

  // Delete language variants
  for (const lang of LANGUAGES) {
    const langFilePath = path.join(SPLIT_DIR, lang, filename);
    if (fs.existsSync(langFilePath)) {
      fs.unlinkSync(langFilePath);
      console.log(`  Deleted language variant: ${lang}/${filename}`);
    }
  }
}

// Main function to process all JSON files in the split directory
async function processAllFiles(): Promise<void> {
  console.log('Starting duplicate cleaning process...');
  console.log(`Looking for JSON files in: ${SPLIT_DIR}`);
  
  // Load processed log
  const processedLog = loadProcessedLog();
  console.log(`Loaded processing log. Last run: ${processedLog.lastProcessed}`);
  console.log(`Previously removed ${processedLog.removedFiles.length} duplicate files`);
  console.log(`Previously kept ${processedLog.keptFiles.length} original files`);
  
  // Setup handlers to save progress on interruption
  setupShutdownHandlers(processedLog);
  
  // Get all JSON files from split directory (only in the root, not in language subdirectories)
  const allFiles = fs.readdirSync(SPLIT_DIR)
    .filter(file => file.endsWith('.json') && fs.statSync(path.join(SPLIT_DIR, file)).isFile());
    
  console.log(`Found ${allFiles.length} total JSON files in root directory`);
  
  // Map to store files by githubUrl
  const filesByGithubUrl: Map<string, { file: string, data: ServerData, timestamp: Date }[]> = new Map();
  
  // First pass - group files by githubUrl
  for (const file of allFiles) {
    const filePath = path.join(SPLIT_DIR, file);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent) as ServerData;
      
      // Skip files without githubUrl
      if (!data.githubUrl) {
        console.log(`  Skipping file without githubUrl: ${file}`);
        continue;
      }

      // Get file creation/modification date to determine which is newer
      const stats = fs.statSync(filePath);
      const timestamp = stats.mtime; // Use modification time
      
      // Add to map, grouped by githubUrl
      if (!filesByGithubUrl.has(data.githubUrl)) {
        filesByGithubUrl.set(data.githubUrl, []);
      }
      filesByGithubUrl.get(data.githubUrl)!.push({ file, data, timestamp });
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  // Second pass - identify and remove duplicates
  let removedCount = 0;
  let keptCount = 0;
  
  for (const [githubUrl, files] of filesByGithubUrl.entries()) {
    if (files.length > 1) {
      console.log(`Found ${files.length} duplicates for githubUrl: ${githubUrl}`);
      
      // Sort files by timestamp, newest first
      files.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Keep the newest file
      const keepFile = files[0];
      const hubIdToKeep = getHubIdFromFilename(keepFile.file);
      console.log(`  Keeping file: ${keepFile.file} (newest)`);
      
      // Add to kept files list if not already there
      if (!processedLog.keptFiles.includes(hubIdToKeep)) {
        processedLog.keptFiles.push(hubIdToKeep);
        keptCount++;
      }
      
      // Remove the rest
      for (let i = 1; i < files.length; i++) {
        const removeFile = files[i];
        const hubIdToRemove = getHubIdFromFilename(removeFile.file);
        console.log(`  Removing duplicate: ${removeFile.file}`);
        
        // Delete the file and its language variants
        deleteFileAndLanguageVariants(SPLIT_DIR, removeFile.file);
        
        // Add to removed files list if not already there
        if (!processedLog.removedFiles.includes(hubIdToRemove)) {
          processedLog.removedFiles.push(hubIdToRemove);
          removedCount++;
        }
      }
    } else {
      // No duplicates for this githubUrl
      const singleFile = files[0];
      const hubId = getHubIdFromFilename(singleFile.file);
      
      // Add to kept files list if not already there
      if (!processedLog.keptFiles.includes(hubId)) {
        processedLog.keptFiles.push(hubId);
        keptCount++;
      }
    }
  }
  
  // Final save of the processing log
  saveProcessedLog(processedLog);
  
  console.log('\nCleanup Summary:');
  console.log(`Total unique githubUrls found: ${filesByGithubUrl.size}`);
  console.log(`New files kept (originals): ${keptCount}`);
  console.log(`New duplicate files removed: ${removedCount}`);
  console.log(`Total files kept to date: ${processedLog.keptFiles.length}`);
  console.log(`Total duplicates removed to date: ${processedLog.removedFiles.length}`);
  console.log('Duplicate cleaning process completed!');
}

// Execute the main function
processAllFiles().catch(error => {
  console.error('An error occurred during processing:', error);
  process.exit(1);
});
