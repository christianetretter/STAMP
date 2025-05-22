const fs = require('fs');
const path = require('path');

const baseUrl = '';

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace absolute URLs with relative paths
    content = content.replace(new RegExp(baseUrl, 'g'), '');
    
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