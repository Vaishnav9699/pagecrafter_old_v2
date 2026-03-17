const fs = require('fs');
const path = require('path');

function resolveConflictsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern to look for `<<<<<<< HEAD`
    // followed by any lines (non-greedy) until `=======`
    // followed by any lines (non-greedy) until `>>>>>>> [hex]` or just `>>>>>>> `
    
    // Some files might have `>>>>>>> hash` while others might be just `>>>>>>> ` or something.
    // Also Windows vs Unix line endings \r?\n

    // Split content line by line to handle this more robustly
    const lines = content.split(/\r?\n/);
    let resolvedLines = [];
    let inConflict = false;
    let keepingHead = false;

    let modified = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('<<<<<<< HEAD')) {
            inConflict = true;
            keepingHead = true;
            modified = true;
            continue;
        }
        
        if (line.startsWith('=======')) {
            if (inConflict) {
                keepingHead = false; // Stop keeping lines, we are in the target branch part now
                continue;
            }
        }
        
        if (line.startsWith('>>>>>>> ')) {
            if (inConflict) {
                inConflict = false; // End of conflict block
                continue;
            }
        }

        if (inConflict) {
            if (keepingHead) {
                resolvedLines.push(line);
            }
            // else skip the lines
        } else {
            resolvedLines.push(line);
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, resolvedLines.join('\n'), 'utf8');
        console.log('Fixed', filePath);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.next') continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.json') || fullPath.endsWith('.md'))) {
            resolveConflictsInFile(fullPath);
        }
    }
}

processDirectory(process.cwd());
console.log('Finished resolving conflicts by keeping HEAD.');
