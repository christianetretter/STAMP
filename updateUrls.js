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
    let replacements = 0;
    
    if (mode === 'prod') {
        if (filePath.endsWith('.html')) {
            // Replace relative paths with GitHub Pages URLs
            content = content.replace(/(href|src)="\/(?!\/)/g, function(match) { replacements++; return '$1="' + baseUrl; });
            // Update fetch calls for components with leading slash
            content = content.replace(/fetch\('\/Components\//g, function(match) { replacements++; return "fetch('" + baseUrl + 'Components/'; });
            // Update fetch calls for components without leading slash
            content = content.replace(/fetch\('Components\//g, function(match) { replacements++; return "fetch('" + baseUrl + 'Components/'; });
            // Update script src attributes
            content = content.replace(/(src=")(?!http|https|\/\/)([^\"]*\.js)/g, function(match) { replacements++; return match.replace('src="', 'src="' + baseUrl); });
            // Update href attributes
            content = content.replace(/(href=")(?!http|https|\/\/)([^\"]*\.html)/g, function(match) { replacements++; return match.replace('href="', 'href="' + baseUrl); });
            // Update relative paths in href/src without leading slash
            content = content.replace(/(href|src)="(?!http|https|\/\/)([^\"]*\.(?:html|css|js|pdf|png|jpg|jpeg|gif|svg))/g, function(match) { replacements++; return match.replace(/(href|src)="/, '$1="' + baseUrl); });
        } else if (filePath.endsWith('.css')) {
            // Update url(...) in CSS files
            content = content.replace(/url\((['"]?)(?!http|https|data:|\/\/)([^'"\)]+)\1\)/g, function(match, quote, relPath) {
                // Remove leading ./ or ../
                let cleanPath = relPath.replace(/^\.\/?/, '');
                replacements++;
                return `url(${quote}${baseUrl}${cleanPath}${quote})`;
            });
        }
    } else {
        if (filePath.endsWith('.html')) {
            // Ersetze href/src mit baseUrl am Anfang durch relative Pfade, auch wenn dazwischen Whitespace ist
            let regex = new RegExp('(href|src)\s*=\s*"' + baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            content = content.replace(regex, function(match, p1) { replacements++; return p1 + '="'; });
            // Entferne baseUrl in fetch-Calls
            content = content.replace(/fetch\('https:\/\/christianetretter\.github\.io\/STAMP\/Components\//g, function(match) { replacements++; return "fetch('Components/"; });
        } else if (filePath.endsWith('.css')) {
            // Ersetze url("baseUrl...") durch url("...")
            let regex = new RegExp('url\\(([' + "'\"`" + '])' + baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            content = content.replace(regex, function(match, p1) { replacements++; return 'url(' + p1; });
        }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated file: ${filePath} (${replacements} replacements)`);
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