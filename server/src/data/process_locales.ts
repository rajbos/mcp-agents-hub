#!/usr/bin/env tsx

// A script to translate the name and description fields of JSON files in the split directory
// into different languages and save them in language-specific subfolders

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LANGUAGES, translateText } from '../lib/llmTools.js';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory paths
const SPLIT_DIR = path.join(__dirname, 'split');
const OUTPUT_BASE_DIR = SPLIT_DIR;
const LOG_FILE = path.join(__dirname, 'process_locales.log.json');

// Specific languages to process
const LANGUAGES_TO_PROCESS = ['en', 'zh-hans', 'zh-hant', 'ja', 'es', 'de'];

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

// Main function to process all JSON files
async function processAllFiles(): Promise<void> {
  console.log('Starting translation process...');
  console.log(`Looking for JSON files in: ${SPLIT_DIR}`);
  
  // Load processed log
  const processedLog = loadProcessedLog();
  console.log(`Loaded processing log. Last run: ${processedLog.lastProcessed}`);
  console.log(`Previously processed ${processedLog.processedFiles.length} files`);
  
  // Setup handlers to save progress on interruption
  setupShutdownHandlers(processedLog);
  
  // Create language subdirectories - only for the specific languages we want to process
  for (const lang of LANGUAGES_TO_PROCESS) {
    if (lang === 'en') continue; // Skip English as it's the source language
    const langDir = path.join(OUTPUT_BASE_DIR, lang);
    ensureDirectoryExists(langDir);
    console.log(`Created/verified directory for ${lang}: ${langDir}`);
  }
  
  // Get all JSON files from split directory
  const allFiles = fs.readdirSync(SPLIT_DIR).filter(file => file.endsWith('.json'));
  console.log(`Found ${allFiles.length} total JSON files`);
  
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
      
      // For each language in our specific list except English (assuming English is the source)
      for (const lang of LANGUAGES_TO_PROCESS) {
        if (lang === 'en') continue;
        
        // Create a copy of the data to modify
        const translatedData = { ...data };
        
        console.log(`  Translating to ${LANGUAGES[lang]} (${lang})...`);
        
        // Translate name and description fields using the imported translateText function
        if (translatedData.name) {
          translatedData.name = await translateText(translatedData.name, lang);
          // Remove any quotation marks that might have been added
          translatedData.name = translatedData.name.replace(/^["']|["']$/g, '');
        }
        
        if (translatedData.description) {
          translatedData.description = await translateText(translatedData.description, lang);
          // Remove any quotation marks that might have been added
          translatedData.description = translatedData.description.replace(/^["']|["']$/g, '');
        }
        
        // Save translated file to language subdirectory
        const outputFilePath = path.join(OUTPUT_BASE_DIR, lang, file);
        fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2), 'utf8');
        // console.log(`  Saved translated file to ${outputFilePath}`);
      }
      
      // Add the successfully processed file to our log
      processedLog.processedFiles.push(hubId);
      
      // Save the log after each file to ensure we don't lose progress on interruption
      saveProcessedLog(processedLog);
      
      console.log(`  Completed translations for ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  // Final save of the processing log
  saveProcessedLog(processedLog);
  console.log('Translation process completed!');
}

// Execute the main function
processAllFiles().catch(error => {
  console.error('An error occurred during processing:', error);
  process.exit(1);
});