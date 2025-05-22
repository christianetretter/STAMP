const fs = require('fs');
const path = require('path');

// Set this to '' for local development
//const baseUrl = '';
// Set this to your GitHub Pages URL for production
const baseUrl = 'https://christianetretter.github.io/STAMP/';

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace relative paths with GitHub Pages URLs
    content = content.replace(/(href|src)="\/(?!\/)/g, '$1="' + baseUrl);
    
    fs.writeFileSync(filePath, content);
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
            updateFile(filePath);
        }
    });
}

// Start processing from the current directory
processDirectory('.'); 