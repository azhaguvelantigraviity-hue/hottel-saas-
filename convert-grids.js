const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src/pages');

// Find all JSX files
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getFiles(directoryPath);

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace repeating grids with auto-fit responsive equivalents
  // e.g. repeat(4, 1fr) or repeat(4,1fr)
  content = content.replace(/repeat\(\s*4\s*,\s*1fr\s*\)/g, "repeat(auto-fit, minmax(min(100%, 240px), 1fr))");
  content = content.replace(/repeat\(\s*3\s*,\s*1fr\s*\)/g, "repeat(auto-fit, minmax(min(100%, 280px), 1fr))");
  
  // Replace direct fraction columns for 2 or 3 columns
  // e.g. '1fr 1fr' or '1fr 1fr 1fr'
  // Only replace if it matches exactly those strings within single quotes to avoid breaking nested structures
  content = content.replace(/'1fr 1fr'/g, "'repeat(auto-fit, minmax(min(100%, 300px), 1fr))'");
  content = content.replace(/'1fr 1fr 1fr'/g, "'repeat(auto-fit, minmax(min(100%, 280px), 1fr))'");
  content = content.replace(/'1fr 1fr 1fr 1fr'/g, "'repeat(auto-fit, minmax(min(100%, 240px), 1fr))'");

  // Replace rigid maxWidth modals
  content = content.replace(/maxWidth:\s*'600px'/g, "width: '100%', maxWidth: '600px'");
  content = content.replace(/maxWidth:\s*'500px'/g, "width: '100%', maxWidth: '500px'");
  content = content.replace(/maxWidth:\s*'400px'/g, "width: '100%', maxWidth: '400px'");
  
  // Avoid duplicating width: '100%' if already present
  content = content.replace(/width:\s*'100%',\s*width:\s*'100%',/g, "width: '100%',");

  // Fix rigid top level paddings
  content = content.replace(/padding:\s*'32px'/g, "padding: 'clamp(16px, 4vw, 32px)'");
  content = content.replace(/padding:\s*'24px'/g, "padding: 'clamp(12px, 3vw, 24px)'");

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    totalReplaced++;
    console.log(`Updated: ${path.basename(file)}`);
  }
});

console.log(`\nFinished converting grids. Modified ${totalReplaced} files.`);
