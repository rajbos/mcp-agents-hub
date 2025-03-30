import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the split folder
const splitFolderPath = path.join(__dirname, 'split');

// Process all JSON files in the folder
async function processSplitFolder() {
  try {
    // Get all files in the split folder
    const files = fs.readdirSync(splitFolderPath);
    
    // Filter to only include JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} JSON files to process`);
    let modifiedCount = 0;

    // Process each JSON file
    for (const file of jsonFiles) {
      const filePath = path.join(splitFolderPath, file);
      
      // Read the file content
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse the JSON data
      const data = JSON.parse(fileContent);
      
      // Check if mcpId starts with 'https://'
      if (data.mcpId && data.mcpId.startsWith('https://')) {
        // Remove 'https://' from mcpId
        data.mcpId = data.mcpId.replace('https://', '');
        
        // Write the modified data back to the file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        
        modifiedCount++;
      }
    }
    
    console.log(`Modified ${modifiedCount} files to remove 'https://' from mcpId field`);
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Run the function
processSplitFolder();