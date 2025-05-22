const fs = require('fs');
const path = require('path');

// Get the mode from command line argument
const mode = process.argv[2] || 'local';

// Set the base URL based on mode
const baseUrl = mode === 'prod' 
    ? 'https://christianetretter.github.io/STAMP/'
    : '';

console.log(`Running in ${mode} mode with baseUrl: ${baseUrl || '(empty)'}`);

function updateFile(filePath) {
    console.log(`Processing file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (mode === 'prod') {
        if (filePath.endsWith('.html')) {
            // Replace relative paths with GitHub Pages URLs
            content = content.replace(/(href|src)="\/(?!\/)/g, '$1="' + baseUrl);
            // Update fetch calls for components with leading slash
            content = content.replace(/fetch\('\/Components\//g, "fetch('" + baseUrl + 'Components/');
            // Update fetch calls for components without leading slash
            content = content.replace(/fetch\('Components\//g, "fetch('" + baseUrl + 'Components/');
            // Update script src attributes
            content = content.replace(/(src=")(?!http|https|\/\/)([^"]*\.js)/g, '$1' + baseUrl + '$2');
            // Update href attributes
            content = content.replace(/(href=")(?!http|https|\/\/)([^"]*\.html)/g, '$1' + baseUrl + '$2');
            // Update relative paths in href/src without leading slash
            content = content.replace(/(href|src)="(?!http|https|\/\/)([^"]*\.(?:html|css|js|pdf|png|jpg|jpeg|gif|svg))/g, '$1="' + baseUrl + '$2');
        } else if (filePath.endsWith('.css')) {
            // Update url(...) in CSS files
            content = content.replace(/url\((['"]?)(?!http|https|data:|\/\/)([^'"\)]+)\1\)/g, function(match, quote, relPath) {
                // Remove leading ./ or ../
                let cleanPath = relPath.replace(/^\.\/?/, '');
                return `url(${quote}${baseUrl}${cleanPath}${quote})`;
            });
        }
    } else {
        if (filePath.endsWith('.html')) {
            content = content.replace(new RegExp(baseUrl, 'g'), '');
            content = content.replace(/fetch\('https:\/\/christianetretter\.github\.io\/STAMP\/Components\//g, "fetch('Components/");
        } else if (filePath.endsWith('.css')) {
            // Remove baseUrl from url(...) in CSS files
            content = content.replace(new RegExp(baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated file: ${filePath}`);
}

function processDirectory(directory) {
    console.log(`Scanning directory: ${directory}`);
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html') || file.endsWith('.css')) {
            updateFile(filePath);
        }
    });
}

// Start processing from the current directory
console.log('Starting URL update process...');
processDirectory('.');
console.log('URL update process completed!'); 