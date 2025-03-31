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

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Main function to process all JSON files
async function processAllFiles(): Promise<void> {
  console.log('Starting translation process...');
  console.log(`Looking for JSON files in: ${SPLIT_DIR}`);
  
  // Create language subdirectories - use the keys directly from LANGUAGES object
  for (const lang of Object.keys(LANGUAGES)) {
    if (lang === 'en') continue; // Skip English as it's the source language
    const langDir = path.join(OUTPUT_BASE_DIR, lang);
    ensureDirectoryExists(langDir);
    console.log(`Created/verified directory for ${lang}: ${langDir}`);
  }
  
  // Get all JSON files from split directory
  const files = fs.readdirSync(SPLIT_DIR).filter(file => file.endsWith('.json'));
  console.log(`Found ${files.length} JSON files to process.`);
  
  // Process each file
  for (const [index, file] of files.entries()) {
    try {
      console.log(`Processing file ${index + 1}/${files.length}: ${file}`);
      const filePath = path.join(SPLIT_DIR, file);
      
      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // For each language except English (assuming English is the source)
      for (const lang of Object.keys(LANGUAGES)) {
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
        console.log(`  Saved translated file to ${outputFilePath}`);
      }
      
      console.log(`  Completed translations for ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  console.log('Translation process completed!');
}

// Execute the main function
processAllFiles().catch(error => {
  console.error('An error occurred during processing:', error);
  process.exit(1);
});