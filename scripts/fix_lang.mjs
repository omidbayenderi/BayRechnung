import fs from 'fs';

const path = 'src/context/LanguageContext.jsx';
let content = fs.readFileSync(path, 'utf8');

let braceLevel = 0;
let currentLang = '';
let inLangBlock = false;
let seenKeys = new Set();
const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Determine if we start a language block
    const isLangStart = line.match(/^(\s*)(en|de|fr|tr|es):\s*\{/);
    if (isLangStart && braceLevel === 1) {
        currentLang = isLangStart[2];
        inLangBlock = true;
        seenKeys.clear();
    }

    // Count braces to know object depth
    let initialBraceLevel = braceLevel;
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') braceLevel++;
        else if (line[j] === '}') braceLevel--;
    }

    if (inLangBlock && initialBraceLevel === 1 && braceLevel === 1) {
        // Just started, or just ended moving to next line
    } else if (inLangBlock && initialBraceLevel === 2 && braceLevel === 1) {
        // Ended language block
        inLangBlock = false;
        currentLang = '';
    }

    if (inLangBlock && initialBraceLevel >= 2) {
        const keyMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
        if (keyMatch && !line.trim().startsWith('//')) {
            const key = keyMatch[1];
            if (seenKeys.has(key)) {
                console.log(`Removed duplicate duplicate: ${key} in ${currentLang}`);
                newLines.push('// DUPLICATE REMOVED ' + line);
                continue;
            } else {
                seenKeys.add(key);
            }
        }
    }

    newLines.push(line);
}

fs.writeFileSync(path, newLines.join('\n'));
