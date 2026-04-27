const fs = require('fs');
const path = require('path');

const files = [
    './backend/routes/task.routes.js',
    './backend/controllers/task.controller.js',
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        // Simple check for basic syntax errors like mismatched brackets (very basic)
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        console.log(`${file}: { count: ${openBraces}, } count: ${closeBraces}`);
        
        // Use node's check flag if possible? No, I can't run node with flags easily if powershell is missing.
    } catch (err) {
        console.error(`Error reading ${file}:`, err);
    }
});
