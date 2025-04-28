#!/usr/bin/env tsx

// A script to update GitHub information in JSON files in the split directory
// Uses fetchGithubInfo to collect GitHub repository information

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchGithubInfo, extractGithubRepoInfo } from '../lib/githubEnrichment.js';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory paths
const SPLIT_DIR = path.join(__dirname, 'split');
const LOG_FILE = path.join(__dirname, 'process_githubinfo.log.json');

// Languages to process (for language subdirectories)
const LANGUAGES = ['zh-hans', 'zh-hant', 'ja', 'es', 'de'];

// Structure for tracking processed files
interface ProcessedLog {
  lastProcessed: string; // Timestamp of last run
  processedFiles: string[]; // Array of processed hubIds (filenames without .json)
  errors: Record<string, string>; // Record of errors by file
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
    processedFiles: [],
    errors: {}
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

// Function to update GitHub information in a file
async function updateGithubInfoInFile(filePath: string): Promise<boolean> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Skip if no GitHub URL
    if (!data.githubUrl || !data.githubUrl.startsWith('https://github.com')) {
      console.log(`  Skipping ${path.basename(filePath)}: No valid GitHub URL`);
      return false;
    }
    
    // Fetch GitHub repository information
    const githubInfo = await fetchGithubInfo(data.githubUrl);
    if (!githubInfo) {
      console.warn(`  Failed to fetch GitHub info for ${data.githubUrl}`);
      return false;
    }
    
    // Update fields
    let updated = false;
    
    // Update githubStars
    if (githubInfo.stars_count !== undefined && (data.githubStars === undefined || data.githubStars !== githubInfo.stars_count)) {
      data.githubStars = githubInfo.stars_count;
      updated = true;
    }
    
    // Update author if owner_name is available
    if (githubInfo.owner_name && data.author !== githubInfo.owner_name) {
      data.author = githubInfo.owner_name;
      updated = true;
    }
    
    // Add other fields with specified naming convention
    if (githubInfo.latest_update_time) {
      data.updatedAt = githubInfo.latest_update_time;
      updated = true;
    }
    
    if (githubInfo.latest_commit_id && data.githubLatestCommit !== githubInfo.latest_commit_id) {
      data.githubLatestCommit = githubInfo.latest_commit_id;
      updated = true;
    }
    
    if (githubInfo.fork_count !== undefined && data.githubForks !== githubInfo.fork_count) {
      data.githubForks = githubInfo.fork_count;
      updated = true;
    }
    
    if (githubInfo.license_type !== undefined && data.licenseType !== githubInfo.license_type) {
      data.licenseType = githubInfo.license_type;
      updated = true;
    }
    
    // Save the updated file if changes were made
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`  Updated GitHub info in ${path.basename(filePath)}`);
    } else {
      console.log(`  No changes needed for ${path.basename(filePath)}`);
    }
    
    return updated;
  } catch (error) {
    console.error(`Error updating GitHub info in ${filePath}:`, error);
    return false;
  }
}

// Main function to process all JSON files in the split directory
async function processAllFiles(): Promise<void> {
  console.log('Starting GitHub info update process...');
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
      
      // Update GitHub info in the main file
      const updated = await updateGithubInfoInFile(filePath);
      
      if (updated) {
        // If the main file was updated, also update in each language subdirectory if the file exists
        for (const lang of LANGUAGES) {
          const langDir = path.join(SPLIT_DIR, lang);
          const langFilePath = path.join(langDir, file);
          
          if (fs.existsSync(langFilePath)) {
            await updateGithubInfoInFile(langFilePath);
            console.log(`  Updated GitHub info in ${lang}/${file}`);
          }
        }
      }
      
      // Add the successfully processed file to our log
      processedLog.processedFiles.push(hubId);
      
      // Save the log after each file to ensure we don't lose progress on interruption
      saveProcessedLog(processedLog);
      
      console.log(`  Completed GitHub info updates for ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      processedLog.errors[file] = String(error);
    }
  }
  
  // Final save of the processing log
  saveProcessedLog(processedLog);
  
  // Report on any errors
  const errorCount = Object.keys(processedLog.errors).length;
  if (errorCount > 0) {
    console.log(`Process completed with ${errorCount} errors. Check the log file for details.`);
  } else {
    console.log('GitHub info update process completed successfully!');
  }
}

// Execute the main function
processAllFiles().catch(error => {
  console.error('An error occurred during processing:', error);
  process.exit(1);
});
